import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import sharp from 'sharp';

import { StorageFile } from '@/core/storage/interfaces/storage.interface';

export interface ImageDimensionRule {
    width?: number;
    height?: number;
    maxSizeMb?: number;
    allowedMimetypes?: string[];
}

export type FieldDimensionRules = Record<string, ImageDimensionRule>;

@Injectable()
export class ImageDimensionValidationPipe implements PipeTransform {
    constructor(private readonly rules: FieldDimensionRules) {}

    async transform(files: Record<string, StorageFile[]>): Promise<Record<string, StorageFile[]>> {
        if (!files) return files;

        for (const [fieldName, rule] of Object.entries(this.rules)) {
            const fileList = files[fieldName];
            if (!fileList || fileList.length === 0) continue;

            const file = fileList[0];

            // 1. Max File Size Check
            if (rule.maxSizeMb) {
                const maxBytes = rule.maxSizeMb * 1024 * 1024;
                if (file.size > maxBytes) {
                    throw new BadRequestException(`Kích thước file ${fieldName} lớn hơn ${rule.maxSizeMb}MB!`);
                }
            }

            // 2. MIME Type Check
            if (rule.allowedMimetypes && rule.allowedMimetypes.length > 0) {
                if (!rule.allowedMimetypes.includes(file.mimetype)) {
                    throw new BadRequestException(`Hình ảnh ${fieldName} phải có định dạng ${rule.allowedMimetypes.join(', ')}`);
                }
            }

            // 3. Image Dimensions Check (Width & Height)
            if (rule.width || rule.height) {
                try {
                    const metadata = await sharp(file.buffer).metadata();
                    if (rule.width && metadata.width !== rule.width) {
                        throw new BadRequestException(
                            `Hình ảnh ${fieldName} phải có chiều rộng ${rule.width}px. Kích thước hiện tại: ${metadata.width}x${metadata.height}`,
                        );
                    }
                    if (rule.height && metadata.height !== rule.height) {
                        throw new BadRequestException(
                            `Hình ảnh ${fieldName} phải có chiều cao ${rule.height}px. Kích thước hiện tại: ${metadata.width}x${metadata.height}`,
                        );
                    }
                } catch (err: any) {
                    if (err instanceof BadRequestException) throw err;
                    throw new BadRequestException(`Không thể kiểm tra kích thước hình ảnh ${fieldName}`);
                }
            }
        }

        return files;
    }
}
