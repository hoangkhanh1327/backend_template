import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { StorageFile } from '@/core/storage/interfaces/storage.interface';

export interface FileValidationOptions {
    maxSizeMb?: number;
    allowedMimetypes?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
    constructor(private readonly options: FileValidationOptions = {}) {}

    transform(file: StorageFile): StorageFile {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const maxSize = (this.options.maxSizeMb || 10) * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException(`File size exceeds maximum limit of ${this.options.maxSizeMb || 10}MB`);
        }

        if (this.options.allowedMimetypes && this.options.allowedMimetypes.length > 0) {
            const isAllowed = this.options.allowedMimetypes.includes(file.mimetype);
            if (!isAllowed) {
                throw new BadRequestException(
                    `File type ${file.mimetype} is not allowed. Allowed types: ${this.options.allowedMimetypes.join(', ')}`,
                );
            }
        }

        return file;
    }
}
