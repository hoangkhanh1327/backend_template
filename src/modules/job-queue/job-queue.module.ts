import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { ContentPublishController } from '@/modules/job-queue/publish-content/content-publish.controller';
import { ContentPublishProcessor } from '@/modules/job-queue/publish-content/content-publish.processor';
import { ContentPublishService } from '@/modules/job-queue/publish-content/content-publish.service';
import { QUEUES } from '@/shared/constants/queues.constant';

@Module({
    imports: [
        BullModule.registerQueue({
            name: QUEUES.CONTENT_PUBLISH,
        }),
    ],
    controllers: [ContentPublishController],
    providers: [ContentPublishService, ContentPublishProcessor],
    exports: [ContentPublishService],
})
export class JobQueueModule {}
