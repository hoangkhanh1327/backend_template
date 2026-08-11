import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PinoLoggerService } from '@/core/logger/logger.service';
import { AuditLogService } from '@/modules/audit-logs/audit-log.service';
import { AuditLogEntity } from '@/modules/audit-logs/entities/audit-log.entity';

@Injectable()
export class AuditLogListener {
    constructor(
        private readonly auditLogService: AuditLogService,
        private readonly logger: PinoLoggerService,
    ) {}

    @OnEvent('audit.log.created', { async: true })
    async handleAuditLogCreated(payload: Partial<AuditLogEntity>) {
        try {
            await this.auditLogService.createLog(payload);
        } catch (err: any) {
            this.logger.error(`Failed to persist audit log: ${err.message}`, err.stack, 'AuditLogListener');
        }
    }
}
