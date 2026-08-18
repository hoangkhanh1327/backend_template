import { ApiProperty } from '@nestjs/swagger';

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    timestamp: string;
    traceId: string;
    data?: T;
}

export class BaseResponseDto<T> implements ApiResponse<T> {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Success' })
    message: string;

    @ApiProperty({ example: '2026-08-10T14:00:00.000Z' })
    timestamp: string;

    @ApiProperty({ example: 'req-uuid-v4' })
    traceId: string;

    data?: T;
}
