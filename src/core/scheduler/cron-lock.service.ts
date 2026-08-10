import { Injectable } from '@nestjs/common';

import { PinoLoggerService } from '@/core/logger/logger.service';
import { RedisService } from '@/core/redis/redis.service';

@Injectable()
export class CronLockService {
    constructor(
        private readonly redisService: RedisService,
        private readonly logger: PinoLoggerService,
    ) {}

    /**
     * Tries to acquire a Distributed Redis Lock for a scheduled Cron task.
     * Prevents duplicate execution across multiple server instances in cluster mode.
     */
    async acquireLock(lockKey: string, ttlSeconds = 60): Promise<boolean> {
        const fullKey = `cron:lock:${lockKey}`;
        const client = this.redisService.getClient();

        // SET key 'locked' EX ttlSeconds NX
        const result = await client.set(fullKey, 'locked', 'EX', ttlSeconds, 'NX');
        const acquired = result === 'OK';

        if (acquired) {
            this.logger.log(`[Cron Lock] Acquired lock '${lockKey}' for ${ttlSeconds}s`, 'CronLockService');
        } else {
            this.logger.debug(`[Cron Lock] Lock '${lockKey}' already held by another instance. Skipping execution.`, 'CronLockService');
        }

        return acquired;
    }

    /**
     * Releases an acquired Cron lock manually if needed
     */
    async releaseLock(lockKey: string): Promise<void> {
        const fullKey = `cron:lock:${lockKey}`;
        await this.redisService.getClient().del(fullKey);
        this.logger.log(`[Cron Lock] Released lock '${lockKey}'`, 'CronLockService');
    }
}
