import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

import { PinoLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class ImageOptimizationService {
    constructor(private readonly logger: PinoLoggerService) {}

    async convertToWebp(buffer: Buffer, quality = 80): Promise<Buffer> {
        try {
            return await sharp(buffer).webp({ quality }).toBuffer();
        } catch (err: any) {
            this.logger.warn(`Failed to convert image to WebP: ${err.message}`, 'ImageOptimizationService');
            return buffer;
        }
    }

    async resizeImage(buffer: Buffer, width: number, height?: number): Promise<Buffer> {
        try {
            return await sharp(buffer).resize(width, height, { fit: 'inside', withoutEnlargement: true }).toBuffer();
        } catch (err: any) {
            this.logger.warn(`Failed to resize image: ${err.message}`, 'ImageOptimizationService');
            return buffer;
        }
    }
}
