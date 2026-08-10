import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { PinoLoggerService } from '@/core/logger/logger.service';
import { QUEUES } from '@/shared/constants/queues.constant';

@Processor(QUEUES.CONTENT_PUBLISH)
@Injectable()
export class ContentPublishProcessor extends WorkerHost {
    constructor(private readonly logger: PinoLoggerService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(
            `[Job Worker] Starting background publish task for Job ID: ${job.id}, Data: ${JSON.stringify(job.data)}`,
            'ContentPublishProcessor',
        );

        // Simulate heavy async publishing logic
        await new Promise((resolve) => setTimeout(resolve, 2000));

        this.logger.log(`[Job Worker] Content publish completed successfully for Job ID: ${job.id}`, 'ContentPublishProcessor');
        return { status: 'published', contentId: job.data.contentId, timestamp: new Date().toISOString() };
    }
}
