import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CronLockService } from '@/core/scheduler/cron-lock.service';

@Global()
@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [CronLockService],
    exports: [ScheduleModule, CronLockService],
})
export class SchedulerModule {}
