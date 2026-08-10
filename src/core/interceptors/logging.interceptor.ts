import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PinoLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: PinoLoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        const { method, url } = req;
        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const delay = Date.now() - now;
                const statusCode = res.statusCode || 200;
                this.logger.log(`[HTTP Response] ${method} ${url} ${statusCode} - ${delay}ms`, 'HTTP');
            }),
        );
    }
}
