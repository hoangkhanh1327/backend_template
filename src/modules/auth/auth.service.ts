import { Injectable, UnauthorizedException } from '@nestjs/common';

import { RefreshTokenDto } from '@/modules/auth/dto/refresh-token.dto';
import { TokenPair, TokenService } from '@/modules/auth/token.service';

@Injectable()
export class AuthService {
    constructor(private readonly tokenService: TokenService) {}

    async login(username: string, pass: string, clientIp?: string, userAgent?: string): Promise<{ user: any; tokens: TokenPair }> {
        if (username !== 'admin' || pass !== 'admin123') {
            throw new UnauthorizedException('Invalid credentials');
        }

        const dummyUser = {
            id: 'usr-12345',
            username: 'admin',
            roles: ['ADMIN'],
        };

        const tokens = await this.tokenService.generateTokenPair(
            {
                userId: dummyUser.id,
                username: dummyUser.username,
                roles: dummyUser.roles,
            },
            clientIp,
            userAgent,
        );

        return {
            user: dummyUser,
            tokens,
        };
    }

    async refreshTokens(dto: RefreshTokenDto, clientIp?: string, userAgent?: string): Promise<TokenPair> {
        return this.tokenService.refreshTokens(dto.refreshToken, clientIp, userAgent);
    }

    async logout(userId: string, jti?: string): Promise<void> {
        if (jti) {
            await this.tokenService.revokeToken(jti, userId);
        } else {
            await this.tokenService.revokeAllUserTokens(userId);
        }
    }
}
