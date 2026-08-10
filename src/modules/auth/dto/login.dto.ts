import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin', description: 'Tên tài khoản đăng nhập' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'admin123', description: 'Mật khẩu đăng nhập' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
