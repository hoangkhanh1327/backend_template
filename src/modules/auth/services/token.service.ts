import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { RedisService } from '@/core/redis/redis.service';
import { IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY_TOKEN } from '@/modules/auth/interfaces/refresh-token.repository.interface';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TokenPayload {
    userId: string;
    username: string;
    roles: string[];
}

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
        private readonly refreshTokenRepo: IRefreshTokenRepository,
    ) {}

    async generateTokenPair(payload: TokenPayload, clientIp?: string, userAgent?: string): Promise<TokenPair> {
        const jti = uuidv4();
        const jwtPayload = {
            sub: payload.userId,
            username: payload.username,
            roles: payload.roles,
            jti,
        };

        const accessToken = await this.jwtService.signAsync(jwtPayload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
        });

        const refreshToken = await this.jwtService.signAsync(
            { sub: payload.userId, username: payload.username, roles: payload.roles, jti },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
            },
        );

        // 7 days expiration in milliseconds
        const ttlSeconds = 7 * 24 * 60 * 60;
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        // 1. Save Refresh Token to Database `refresh_tokens`
        await this.refreshTokenRepo.createToken({
            userId: payload.userId,
            jti,
            token: refreshToken,
            isRevoked: false,
            expiresAt,
            clientIp,
            userAgent,
        });

        // 2. Save Refresh Token to Redis Cache
        await this.redisService.set(`jwt:refresh:${payload.userId}:${jti}`, refreshToken, ttlSeconds);

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes
        };
    }

    async refreshTokens(refreshTokenStr: string, clientIp?: string, userAgent?: string): Promise<TokenPair> {
        let payload: any;
        try {
            payload = await this.jwtService.verifyAsync(refreshTokenStr, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const { sub: userId, jti, username, roles } = payload;

        // Check if token is blacklisted in Redis
        const isBlacklisted = await this.redisService.get(`jwt:blacklist:${jti}`);
        if (isBlacklisted) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        // Check token status in DB
        const tokenEntity = await this.refreshTokenRepo.findByJti(jti);
        if (!tokenEntity || tokenEntity.isRevoked || tokenEntity.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token is invalid or has been revoked');
        }

        // Token Rotation: Revoke the old refresh token
        await this.revokeToken(jti, userId);

        // Issue new token pair
        return this.generateTokenPair({ userId, username, roles }, clientIp, userAgent);
    }

    async revokeToken(jti: string, userId?: string): Promise<void> {
        // 1. Revoke in DB
        await this.refreshTokenRepo.revokeByJti(jti);

        // 2. Add to Redis Blacklist (1 day = 86400s)
        await this.redisService.set(`jwt:blacklist:${jti}`, 'revoked', 86400);

        if (userId) {
            await this.redisService.getClient().del(`jwt:refresh:${userId}:${jti}`);
        }
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenRepo.revokeAllUserTokens(userId);
        await this.redisService.set(`jwt:user_blacklist:${userId}`, 'revoked_all', 86400);
    }
}
