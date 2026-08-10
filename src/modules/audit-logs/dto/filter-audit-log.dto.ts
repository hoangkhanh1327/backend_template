import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@/shared/dtos/pagination.dto';

export class FilterAuditLogDto extends PaginationQueryDto {
    @ApiPropertyOptional({ example: 'USER' })
    @IsString()
    @IsOptional()
    module?: string;

    @ApiPropertyOptional({ example: 'CREATE_USER' })
    @IsString()
    @IsOptional()
    action?: string;

    @ApiPropertyOptional({ example: 'usr-12345' })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional({ example: '2026-08-01T00:00:00.000Z' })
    @IsString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-08-10T23:59:59.999Z' })
    @IsString()
    @IsOptional()
    endDate?: string;
}
