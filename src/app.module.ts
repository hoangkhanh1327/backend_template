import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { TraceIdMiddleware } from '@/core/context/trace-id.middleware';
import { CoreModule } from '@/core/core.module';
import { AuditLogModule } from '@/modules/audit-logs/audit-log.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { JobQueueModule } from '@/modules/job-queue/job-queue.module';
import { UserModule } from '@/modules/users/user.module';
import { SharedModule } from '@/shared/shared.module';

@Module({
    imports: [CoreModule, SharedModule, AuthModule, UserModule, AuditLogModule, JobQueueModule],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TraceIdMiddleware).forRoutes('*');
    }
}
