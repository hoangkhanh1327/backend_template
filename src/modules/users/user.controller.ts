import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/core/guards';
import { AuditLog } from '@/modules/audit-logs/decorators/audit-log.decorator';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UserService } from '@/modules/users/user.service';
import { PaginationQueryDto } from '@/shared/dtos/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @Roles('ADMIN')
    @AuditLog({
        module: 'USERS',
        action: 'CREATE_USER',
        description: 'Tạo người dùng mới trong hệ thống',
    })
    @ApiOperation({ summary: 'Create new user (ADMIN only)' })
    async create(@Body() dto: CreateUserDto) {
        return this.userService.createUser(dto);
    }

    @Get()
    @Roles('ADMIN')
    @AuditLog({
        module: 'USERS',
        action: 'GET_USERS',
        description: 'Xem danh sách người dùng',
    })
    @ApiOperation({ summary: 'Get all users' })
    async findAll(@Query() _query?: PaginationQueryDto) {
        return this.userService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', description: 'User ID (UUID)', example: 'usr-12345' })
    async findOne(@Param('id') id: string) {
        const user = await this.userService.findById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
}
