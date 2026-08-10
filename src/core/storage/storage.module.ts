import { Global, Module } from '@nestjs/common';

import { STORAGE_SERVICE_TOKEN } from '@/core/storage/interfaces/storage.interface';
import { LocalStorageProvider } from '@/core/storage/providers/local-storage.provider';
import { SftpStorageProvider } from '@/core/storage/providers/sftp-storage.provider';
import { ImageOptimizationService } from '@/core/storage/services/image-optimization.service';

@Global()
@Module({
    providers: [
        ImageOptimizationService,
        LocalStorageProvider,
        SftpStorageProvider,
        {
            provide: STORAGE_SERVICE_TOKEN,
            useClass: LocalStorageProvider, // Can switch to SftpStorageProvider or S3StorageProvider via ENV
        },
    ],
    exports: [ImageOptimizationService, LocalStorageProvider, SftpStorageProvider, STORAGE_SERVICE_TOKEN],
})
export class StorageModule {}
