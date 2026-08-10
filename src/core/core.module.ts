import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

import { CdnModule } from '@/core/cdn/cdn.module';
import { validateEnv } from '@/core/config/env.schema';
import { DatabaseModule } from '@/core/database/database.module';
import { HttpClientModule } from '@/core/http/http-client.module';
import { LoggerModule } from '@/core/logger/logger.module';
import { QueueModule } from '@/core/queue/queue.module';
import { RedisModule } from '@/core/redis/redis.module';
import { SchedulerModule } from '@/core/scheduler/scheduler.module';
import { StorageModule } from '@/core/storage/storage.module';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        EventEmitterModule.forRoot(),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100,
            },
        ]),
        LoggerModule,
        DatabaseModule,
        RedisModule,
        QueueModule,
        StorageModule,
        HttpClientModule,
        CdnModule,
        SchedulerModule,
    ],
    exports: [
        ConfigModule,
        EventEmitterModule,
        ThrottlerModule,
        LoggerModule,
        DatabaseModule,
        RedisModule,
        QueueModule,
        StorageModule,
        HttpClientModule,
        CdnModule,
        SchedulerModule,
    ],
})
export class CoreModule {}
