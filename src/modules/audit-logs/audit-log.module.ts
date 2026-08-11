import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogController } from '@/modules/audit-logs/audit-log.controller';
import { AuditLogService } from '@/modules/audit-logs/audit-log.service';
import { AuditLogEntity } from '@/modules/audit-logs/entities/audit-log.entity';
import { AuditInterceptor } from '@/modules/audit-logs/interceptors/audit.interceptor';
import { AuditLogListener } from '@/modules/audit-logs/listeners/audit-log.listener';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLogEntity])],
    controllers: [AuditLogController],
    providers: [
        AuditLogService,
        AuditLogListener,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
    exports: [AuditLogService, TypeOrmModule],
})
export class AuditLogModule {}
