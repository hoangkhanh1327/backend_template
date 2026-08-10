import { Global, Module } from '@nestjs/common';

import { FfmpegService } from '@/shared/media/ffmpeg.service';

@Global()
@Module({
    providers: [FfmpegService],
    exports: [FfmpegService],
})
export class MediaModule {}
