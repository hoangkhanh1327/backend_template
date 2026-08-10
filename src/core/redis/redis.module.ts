import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { PinoLoggerService } from '@/core/logger/logger.service';
import { RedisService } from '@/core/redis/redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_DATA_CLIENT = 'REDIS_DATA_CLIENT';
export const REDIS_PROMOTION_CLIENT = 'REDIS_PROMOTION_CLIENT';

@Global()
@Module({
    providers: [
        RedisService,
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService, PinoLoggerService],
            useFactory: (config: ConfigService, logger: PinoLoggerService): Redis => {
                const client = new Redis({
                    host: config.get<string>('REDIS_HOST', '127.0.0.1'),
                    port: config.get<number>('REDIS_PORT', 6379),
                    password: config.get<string>('REDIS_PASSWORD') || undefined,
                    db: config.get<number>('REDIS_DB', 0),
                    lazyConnect: true,
                });
                client.on('error', (err) => logger.error(`Redis Main Error: ${err.message}`, err.stack, 'RedisModule'));
                return client;
            },
        },
        {
            provide: REDIS_DATA_CLIENT,
            inject: [ConfigService, PinoLoggerService],
            useFactory: (config: ConfigService, logger: PinoLoggerService): Redis => {
                const host = config.get<string>('REDIS_DATA_HOST', config.get<string>('REDIS_HOST', '127.0.0.1'));
                const port = config.get<number>('REDIS_DATA_PORT', 6380);
                const password = config.get<string>('REDIS_DATA_PASS') || undefined;

                const client = new Redis({
                    host,
                    port,
                    password,
                    lazyConnect: true,
                });
                client.on('error', (err) => logger.error(`Redis Data Error: ${err.message}`, err.stack, 'RedisModule'));
                return client;
            },
        },
        {
            provide: REDIS_PROMOTION_CLIENT,
            inject: [ConfigService, PinoLoggerService],
            useFactory: (config: ConfigService, logger: PinoLoggerService): Redis => {
                const host = config.get<string>('REDIS_PROMOTION_HOST', config.get<string>('REDIS_HOST', '127.0.0.1'));
                const port = config.get<number>('REDIS_PROMOTION_PORT', 7380);
                const password = config.get<string>('REDIS_PROMOTION_PASS') || undefined;

                const client = new Redis({
                    host,
                    port,
                    password,
                    lazyConnect: true,
                });
                client.on('error', (err) => logger.error(`Redis Promotion Error: ${err.message}`, err.stack, 'RedisModule'));
                return client;
            },
        },
    ],
    exports: [RedisService, REDIS_CLIENT, REDIS_DATA_CLIENT, REDIS_PROMOTION_CLIENT],
})
export class RedisModule {}
