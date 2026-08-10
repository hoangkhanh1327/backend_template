import { Global, Module } from '@nestjs/common';

import { ExcelModule } from '@/shared/excel/excel.module';
import { MediaModule } from '@/shared/media/media.module';

@Global()
@Module({
    imports: [ExcelModule, MediaModule],
    exports: [ExcelModule, MediaModule],
})
export class SharedModule {}
