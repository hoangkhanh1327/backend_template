import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { PinoLoggerService } from '@/core/logger/logger.service';

const execAsync = promisify(exec);

export interface AudioExtractResult {
    fullPath: string;
    fileName: string;
}

@Injectable()
export class FfmpegService {
    private readonly tmpPath: string;
    private readonly outputPath: string;

    constructor(private readonly logger: PinoLoggerService) {
        this.tmpPath = path.resolve(process.cwd(), 'public', 'tmp_processing');
        this.outputPath = path.resolve(process.cwd(), 'public', 'media_output');

        if (!fs.existsSync(this.tmpPath)) {
            fs.mkdirSync(this.tmpPath, { recursive: true });
        }
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }
    }

    /**
     * Extracts AAC audio track from HLS / M3U8 video stream URL using FFmpeg CLI
     */
    async extractAudioFromHls(linkHls: string, contentId: string): Promise<AudioExtractResult> {
        const fileName = `audio_${contentId}_${Date.now()}.aac`;
        const tmpFilePath = path.join(this.tmpPath, fileName);
        const finalFilePath = path.join(this.outputPath, fileName);

        const command = `ffmpeg -i "${linkHls}" -vn -acodec copy "${tmpFilePath}"`;
        this.logger.log(`Executing FFmpeg command: ${command}`, 'FfmpegService');

        try {
            await execAsync(command, { maxBuffer: 20 * 1024 * 1024 });

            if (fs.existsSync(tmpFilePath)) {
                await fs.promises.rename(tmpFilePath, finalFilePath);
                this.logger.log(`Audio extracted successfully to ${finalFilePath}`, 'FfmpegService');
                return {
                    fullPath: finalFilePath,
                    fileName,
                };
            }
            throw new Error(`FFmpeg output file not found at ${tmpFilePath}`);
        } catch (err: any) {
            this.logger.error(`FFmpeg audio extraction failed for ${linkHls}: ${err.message}`, err.stack, 'FfmpegService');
            if (fs.existsSync(tmpFilePath)) {
                await fs.promises.unlink(tmpFilePath).catch(() => null);
            }
            throw err;
        }
    }
}
