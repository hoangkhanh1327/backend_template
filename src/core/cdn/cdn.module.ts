import { Global, Module } from '@nestjs/common';

import { CdnService } from '@/core/cdn/cdn.service';

@Global()
@Module({
    providers: [CdnService],
    exports: [CdnService],
})
export class CdnModule {}
