import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
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
