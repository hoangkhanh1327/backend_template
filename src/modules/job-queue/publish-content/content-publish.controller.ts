import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuditLog } from '@/modules/audit-logs/decorators/audit-log.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { ContentPublishService } from '@/modules/job-queue/publish-content/content-publish.service';
import { PublishContentDto } from '@/modules/job-queue/publish-content/dto/publish-content.dto';

@ApiTags('Job Queue')
@ApiBearerAuth()
@Controller('jobs/publish')
export class ContentPublishController {
    constructor(private readonly publishService: ContentPublishService) {}

    @Post()
    @Roles('ADMIN')
    @HttpCode(HttpStatus.ACCEPTED)
    @AuditLog({
        module: 'JOB_QUEUE',
        action: 'ENQUEUE_PUBLISH',
        description: 'Đẩy tác vụ publish nội dung vào hàng đợi ngầm',
    })
    @ApiOperation({ summary: 'Trigger background content publish job' })
    async triggerPublish(@Body() dto: PublishContentDto) {
        const result = await this.publishService.queuePublishTask(dto.contentId, dto.title);
        return {
            message: 'Background job queued successfully',
            jobId: result.jobId,
        };
    }
}
