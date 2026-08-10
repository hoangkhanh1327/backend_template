import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { RedisService } from '@/core/redis/redis.service';
import { UserPayload } from '@/modules/auth/decorators/current-user.decorator';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private readonly redisService: RedisService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'super_secret_access_key'),
        });
    }

    async validate(payload: any): Promise<UserPayload> {
        // Check if token has been revoked in Redis blacklist
        const isRevoked = await this.redisService.exists(`jwt:blacklist:${payload.jti || payload.sub}`);
        if (isRevoked) {
            throw new UnauthorizedException('Token has been revoked');
        }

        return {
            userId: payload.sub,
            username: payload.username,
            email: payload.email,
            roles: payload.roles || [],
            permissions: payload.permissions || [],
        };
    }
}
