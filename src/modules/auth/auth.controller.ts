import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from '@/modules/auth/auth.service';
import { CurrentUser, UserPayload } from '@/modules/auth/decorators/current-user.decorator';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RefreshTokenDto } from '@/modules/auth/dto/refresh-token.dto';
import { ClientIp } from '@/shared/decorators/client-ip.decorator';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login endpoint' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    async login(@Body() body: LoginDto, @ClientIp() clientIp?: string, @UserAgent() userAgent?: string) {
        return this.authService.login(body.username, body.password, clientIp, userAgent);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh Access Token when expired' })
    @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
    async refreshTokens(@Body() dto: RefreshTokenDto, @ClientIp() clientIp?: string, @UserAgent() userAgent?: string) {
        return this.authService.refreshTokens(dto, clientIp, userAgent);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User logout endpoint' })
    async logout(@CurrentUser() user: UserPayload) {
        await this.authService.logout(user.userId, user.jti);
        return { message: 'Logged out successfully' };
    }
}
