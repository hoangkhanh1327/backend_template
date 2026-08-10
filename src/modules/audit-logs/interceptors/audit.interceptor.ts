import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AlsContext } from '@/core/context/als.context';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '@/modules/audit-logs/decorators/audit-log.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const auditMetadata = this.reflector.getAllAndOverride<AuditLogMetadata>(AUDIT_LOG_KEY, [context.getHandler(), context.getClass()]);

        if (!auditMetadata) {
            return next.handle();
        }

        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: () => this.emitAuditLog(context, auditMetadata, startTime, 200),
                error: (err) => this.emitAuditLog(context, auditMetadata, startTime, err.status || 500),
            }),
        );
    }

    private emitAuditLog(ctx: ExecutionContext, metadata: AuditLogMetadata, startTime: number, statusCode: number) {
        const req = ctx.switchToHttp().getRequest();
        const durationMs = Date.now() - startTime;

        const payload = {
            traceId: AlsContext.getTraceId(),
            userId: AlsContext.getUserId() || 'anonymous',
            module: metadata.module,
            action: metadata.action,
            description: metadata.description,
            method: req.method,
            path: req.raw ? req.raw.url : req.url,
            ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            statusCode,
            durationMs,
            timestamp: new Date().toISOString(),
        };

        // Emit event for async non-blocking log persistence
        this.eventEmitter.emit('audit.log.created', payload);
    }
}
