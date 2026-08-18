import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAccessStrategy, JwtAuthGuard, RolesGuard } from '@/core/guards';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { RefreshTokenEntity } from '@/modules/auth/entities/refresh-token.entity';
import { TokenService } from '@/modules/auth/token.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([RefreshTokenEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, TokenService, JwtAccessStrategy, JwtAuthGuard, RolesGuard],
    exports: [AuthService, TokenService, JwtAuthGuard, RolesGuard, JwtModule, TypeOrmModule],
})
export class AuthModule {}
