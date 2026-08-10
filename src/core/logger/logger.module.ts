import { Global, Module } from '@nestjs/common';

import { PinoLoggerService } from '@/core/logger/logger.service';

@Global()
@Module({
    providers: [PinoLoggerService],
    exports: [PinoLoggerService],
})
export class LoggerModule {}
