import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { PinoLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: PinoLoggerService,
    ) {}

    onModuleInit() {
        this.client = new Redis({
            host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
            db: this.configService.get<number>('REDIS_DB', 0),
            lazyConnect: true,
        });

        this.client.on('connect', () => this.logger.log('Redis connected successfully', 'Redis'));
        this.client.on('error', (err) => this.logger.error(`Redis Error: ${err.message}`, err.stack, 'Redis'));
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }

    getClient(): Redis {
        return this.client;
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
        if (ttlSeconds) {
            return this.client.set(key, value, 'EX', ttlSeconds);
        }
        return this.client.set(key, value);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const res = await this.client.exists(key);
        return res === 1;
    }
}
