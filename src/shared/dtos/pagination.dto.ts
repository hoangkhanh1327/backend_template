import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
    @ApiPropertyOptional({ example: 1, default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @ApiPropertyOptional({ example: 10, default: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit: number = 10;

    @ApiPropertyOptional({ example: 'createdAt' })
    @IsString()
    @IsOptional()
    sortBy: string = 'createdAt';

    @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
    @IsString()
    @IsOptional()
    sortOrder: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({ example: 'search string' })
    @IsString()
    @IsOptional()
    search?: string;
}

export class PaginatedResultDto<T> {
    items: T[];
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}
