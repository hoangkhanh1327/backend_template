import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class PaginationQueryDto {
    @ApiPropertyOptional({ description: 'Số trang hiện tại (bắt đầu từ 1)', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Số lượng bản ghi trên một trang (1 - 100)', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (nếu có)' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Trường dùng để sắp xếp (ví dụ: createdAt, name)' })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({ enum: SortOrder, description: 'Thứ tự sắp xếp (ASC hoặc DESC)', default: SortOrder.DESC })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;

    get skip(): number {
        return ((this.page || 1) - 1) * (this.limit || 10);
    }
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function createPaginatedResponse<T>(items: T[], total: number, query: PaginationQueryDto): PaginatedResult<T> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
