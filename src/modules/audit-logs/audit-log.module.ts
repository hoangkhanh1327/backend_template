import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogController } from '@/modules/audit-logs/controllers/audit-log.controller';
import { AuditLogEntity } from '@/modules/audit-logs/entities/audit-log.entity';
import { AuditInterceptor } from '@/modules/audit-logs/interceptors/audit.interceptor';
import { AuditLogListener } from '@/modules/audit-logs/listeners/audit-log.listener';
import { AuditLogRepository } from '@/modules/audit-logs/repositories/audit-log.repository';
import { AUDIT_LOG_REPOSITORY_TOKEN, AuditLogService } from '@/modules/audit-logs/services/audit-log.service';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLogEntity])],
    controllers: [AuditLogController],
    providers: [
        AuditLogService,
        AuditLogListener,
        {
            provide: AUDIT_LOG_REPOSITORY_TOKEN,
            useClass: AuditLogRepository,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
    exports: [AuditLogService, AUDIT_LOG_REPOSITORY_TOKEN],
})
export class AuditLogModule {}
