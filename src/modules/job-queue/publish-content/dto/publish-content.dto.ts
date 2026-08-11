import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PublishContentDto {
    @ApiProperty({
        example: 'movie-10020',
        description: 'ID của nội dung cần xuất bản',
    })
    @IsString()
    @IsNotEmpty()
    contentId: string;

    @ApiProperty({
        example: 'Lật Mặt 7: Một Điều Ước',
        description: 'Tiêu đề nội dung xuất bản',
    })
    @IsString()
    @IsNotEmpty()
    title: string;
}
