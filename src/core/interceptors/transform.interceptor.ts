import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AlsContext } from '@/core/context/als.context';
import { ApiResponse } from '@/shared/dtos/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map((data) => {
                const statusCode = response.statusCode || HttpStatus.OK;
                const traceId = AlsContext.getTraceId();

                // If data is already in standardized format or paginated payload, wrap cleanly
                let responseMessage = 'Success';
                let responseData = data;

                if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
                    responseMessage = data.message;
                    responseData = data.data;
                }

                return {
                    success: true,
                    statusCode,
                    message: responseMessage,
                    data: responseData !== undefined ? responseData : null,
                    timestamp: new Date().toISOString(),
                    traceId,
                };
            }),
        );
    }
}
