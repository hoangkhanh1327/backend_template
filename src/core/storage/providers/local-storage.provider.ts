import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { PinoLoggerService } from '@/core/logger/logger.service';
import { IStorageService, StorageFile, UploadResult } from '@/core/storage/interfaces/storage.interface';

@Injectable()
export class LocalStorageProvider implements IStorageService {
    private readonly uploadDir: string;
    private readonly baseUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: PinoLoggerService,
    ) {
        this.uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
        this.baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000') + '/uploads';

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(file: StorageFile, folderPath = ''): Promise<UploadResult> {
        const targetFolder = path.join(this.uploadDir, folderPath);
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }

        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        const filePath = path.join(targetFolder, filename);
        const relativeKey = path.join(folderPath, filename).replace(/\\/g, '/');

        await fs.promises.writeFile(filePath, file.buffer);
        this.logger.log(`Uploaded file locally: ${relativeKey}`, 'LocalStorageProvider');

        return {
            url: `${this.baseUrl}/${relativeKey}`,
            key: relativeKey,
            filename,
            mimetype: file.mimetype,
            size: file.size,
        };
    }

    async deleteFile(keyOrUrl: string): Promise<boolean> {
        const key = keyOrUrl.replace(this.baseUrl + '/', '');
        const filePath = path.join(this.uploadDir, key);

        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            this.logger.log(`Deleted local file: ${key}`, 'LocalStorageProvider');
            return true;
        }
        return false;
    }

    async getFileUrl(key: string): Promise<string> {
        return `${this.baseUrl}/${key}`;
    }
}
