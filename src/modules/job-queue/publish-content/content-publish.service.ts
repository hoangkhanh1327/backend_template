import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { QUEUES } from '@/shared/constants/queues.constant';

@Injectable()
export class ContentPublishService {
    constructor(
        @InjectQueue(QUEUES.CONTENT_PUBLISH)
        private readonly publishQueue: Queue,
    ) {}

    async queuePublishTask(contentId: string, title: string): Promise<{ jobId: string }> {
        const job = await this.publishQueue.add(
            'publish_task',
            { contentId, title },
            {
                attempts: 3, // Retry up to 3 times on failure
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
            },
        );

        return { jobId: job.id as string };
    }
}
