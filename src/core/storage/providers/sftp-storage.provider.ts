import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import Client from 'ssh2-sftp-client';
import { v4 as uuidv4 } from 'uuid';

import { PinoLoggerService } from '@/core/logger/logger.service';
import { IStorageService, StorageFile, UploadResult } from '@/core/storage/interfaces/storage.interface';

@Injectable()
export class SftpStorageProvider implements IStorageService {
    private readonly host: string;
    private readonly port: number;
    private readonly user: string;
    private readonly password?: string;
    private readonly remoteRoot: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: PinoLoggerService,
    ) {
        this.host = this.configService.get<string>('SFTP_HOST', '127.0.0.1');
        this.port = this.configService.get<number>('SFTP_PORT', 22);
        this.user = this.configService.get<string>('SFTP_USER', 'root');
        this.password = this.configService.get<string>('SFTP_PASSWORD');
        this.remoteRoot = this.configService.get<string>('SFTP_REMOTE_ROOT', '/uploads');
    }

    private async getClient(): Promise<Client> {
        const client = new Client();
        await client.connect({
            host: this.host,
            port: this.port,
            username: this.user,
            password: this.password,
        });
        return client;
    }

    async uploadFile(file: StorageFile, folderPath = ''): Promise<UploadResult> {
        const client = await this.getClient();
        try {
            const ext = path.extname(file.originalname);
            const filename = `${uuidv4()}${ext}`;
            const targetFolder = path.posix.join(this.remoteRoot, folderPath);
            const fullRemotePath = path.posix.join(targetFolder, filename);
            const relativeKey = path.posix.join(folderPath, filename);

            await client.mkdir(targetFolder, true);
            await client.put(file.buffer, fullRemotePath);

            this.logger.log(`Uploaded file via SFTP: ${relativeKey}`, 'SftpStorageProvider');
            return {
                url: `sftp://${this.host}${fullRemotePath}`,
                key: relativeKey,
                filename,
                mimetype: file.mimetype,
                size: file.size,
            };
        } finally {
            await client.end();
        }
    }

    async deleteFile(keyOrUrl: string): Promise<boolean> {
        const client = await this.getClient();
        try {
            const fullRemotePath = path.posix.join(this.remoteRoot, keyOrUrl);
            const exists = await client.exists(fullRemotePath);
            if (exists) {
                await client.delete(fullRemotePath);
                this.logger.log(`Deleted file via SFTP: ${keyOrUrl}`, 'SftpStorageProvider');
                return true;
            }
            return false;
        } finally {
            await client.end();
        }
    }

    async getFileUrl(key: string): Promise<string> {
        return `sftp://${this.host}${path.posix.join(this.remoteRoot, key)}`;
    }
}
