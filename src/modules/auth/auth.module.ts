import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { RefreshTokenEntity } from '@/modules/auth/entities/refresh-token.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@/modules/auth/interfaces/refresh-token.repository.interface';
import { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import { AuthService } from '@/modules/auth/services/auth.service';
import { TokenService } from '@/modules/auth/services/token.service';
import { JwtAccessStrategy } from '@/modules/auth/strategies/jwt-access.strategy';

@Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({}), TypeOrmModule.forFeature([RefreshTokenEntity])],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokenService,
        JwtAccessStrategy,
        {
            provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
            useClass: RefreshTokenRepository,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionsGuard,
        },
    ],
    exports: [AuthService, TokenService, REFRESH_TOKEN_REPOSITORY_TOKEN],
})
export class AuthModule {}
