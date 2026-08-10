import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ftp from 'basic-ftp';

import { PinoLoggerService } from '@/core/logger/logger.service';

export interface FtpUploadOptions {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    remoteDir?: string;
}

@Injectable()
export class FtpStorageService {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: PinoLoggerService,
    ) {}

    /**
     * Uploads local file (Subtitle AI, Animation asset, image) to remote FTP server
     */
    async uploadFile(localPath: string, remoteFileName: string, options: FtpUploadOptions = {}): Promise<boolean> {
        const client = new ftp.Client();
        client.ftp.verbose = false;

        const host = options.host || this.configService.get<string>('SFTP_HOST', '127.0.0.1');
        const port = options.port || 21;
        const user = options.user || this.configService.get<string>('SFTP_USER', 'anonymous');
        const password = options.password || this.configService.get<string>('SFTP_PASSWORD', '');
        const remoteDir = options.remoteDir || '/uploads';

        try {
            await client.access({
                host,
                port,
                user,
                password,
                secure: false,
            });

            await client.ensureDir(remoteDir);
            await client.uploadFrom(localPath, remoteFileName);

            this.logger.log(`FTP Upload Success: ${remoteFileName} -> ${remoteDir}`, 'FtpStorageService');
            return true;
        } catch (error: any) {
            this.logger.error(`FTP Upload Error for ${remoteFileName}: ${error.message}`, error.stack, 'FtpStorageService');
            return false;
        } finally {
            client.close();
        }
    }
}
