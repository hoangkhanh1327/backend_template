import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class PaginationQueryDto {
    @ApiPropertyOptional({ example: 1, default: 1, description: 'Số trang hiện tại (bắt đầu từ 1)' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @ApiPropertyOptional({ example: 10, default: 10, description: 'Số lượng bản ghi trên một trang (1 - 100)' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit: number = 10;

    @ApiPropertyOptional({ example: 'createdAt', description: 'Trường dùng để sắp xếp' })
    @IsString()
    @IsOptional()
    sortBy: string = 'createdAt';

    @ApiPropertyOptional({ example: SortOrder.DESC, enum: SortOrder, description: 'Thứ tự sắp xếp (ASC hoặc DESC)' })
    @IsEnum(SortOrder)
    @IsOptional()
    sortOrder: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({ example: 'search string', description: 'Từ khóa tìm kiếm (nếu có)' })
    @IsString()
    @IsOptional()
    search?: string;

    get skip(): number {
        return ((this.page || 1) - 1) * (this.limit || 10);
    }
}

export class PaginatedResultDto<T> {
    items: T[];
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export function createPaginatedResponse<T>(items: T[], totalItems: number, query: PaginationQueryDto): PaginatedResultDto<T> {
    const currentPage = query.page || 1;
    const itemsPerPage = query.limit || 10;
    return {
        items,
        totalItems,
        itemCount: items.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage,
    };
}
