import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

import { AlsContext } from '@/core/context/als.context';
import { PinoLoggerService } from '@/core/logger/logger.service';

export interface StandardApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    errors?: any[];
    timestamp: string;
    path: string;
    traceId: string;
    data?: T;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly logger: PinoLoggerService) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        const traceId = AlsContext.getTraceId();
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any[] = [];

        // 1. NestJS Built-in HTTP Exception
        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null) {
                const resObj = res as any;
                message = resObj.message || exception.message;
                errors = Array.isArray(resObj.message) ? resObj.message : resObj.errors || [];
            }
        }
        // 2. TypeORM Entity Not Found Error (findOneOrFail) -> HTTP 404
        else if (exception instanceof EntityNotFoundError) {
            statusCode = HttpStatus.NOT_FOUND;
            message = 'Dữ liệu yêu cầu không tồn tại trong hệ thống (Resource not found).';
            this.logger.warn(`[EntityNotFound] Path: ${request.url} - ${exception.message}`, 'AllExceptionsFilter');
        }
        // 3. TypeORM Database Query Error (MySQL / PostgreSQL)
        else if (exception instanceof QueryFailedError) {
            const dbErr = exception as any;
            const driverCode = dbErr.code || dbErr.errno;

            // Unique Constraint Violation (MySQL 1062, Postgres 23505)
            if (driverCode === '23505' || driverCode === 1062 || driverCode === 'ER_DUP_ENTRY') {
                statusCode = HttpStatus.CONFLICT;
                message = 'Dữ liệu đã tồn tại trong hệ thống (Duplicate record violation).';
            }
            // Foreign Key Violation (MySQL 1451/1452, Postgres 23503)
            else if (driverCode === '23503' || driverCode === 1451 || driverCode === 1452) {
                statusCode = driverCode === 1451 ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
                message =
                    driverCode === 1451
                        ? 'Không thể xóa dữ liệu do đang được sử dụng ở bảng khác.'
                        : 'Dữ liệu liên quan không hợp lệ hoặc không tồn tại.';
            }
            // Not Null Violation (MySQL 1048, Postgres 23502)
            else if (driverCode === '23502' || driverCode === 1048) {
                statusCode = HttpStatus.BAD_REQUEST;
                message = 'Dữ liệu bị thiếu trường bắt buộc.';
            }
            // Deadlock / Lock Timeout (MySQL 1205/1213, Postgres 40001/40P01)
            else if (['40001', '40P01', 1205, 1213].includes(driverCode)) {
                statusCode = HttpStatus.SERVICE_UNAVAILABLE;
                message = 'Hệ thống đang bận xử lý giao dịch, vui lòng thử lại sau.';
            } else {
                statusCode = HttpStatus.BAD_REQUEST;
                message = 'Thao tác cơ sở dữ liệu không thành công.';
            }

            this.logger.error(`[DB Error] DriverCode: ${driverCode} - ${exception.message}`, exception.stack, 'DatabaseFilter');
        }
        // 4. Mongoose / Mongo Error Handling (if Mongo is used)
        else if ((exception as any)?.name === 'CastError') {
            statusCode = HttpStatus.BAD_REQUEST;
            message = 'Định dạng ID không hợp lệ.';
        }
        // 5. Unhandled Generic Error
        else if (exception instanceof Error) {
            message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
            this.logger.error(`[Unhandled Error] ${exception.message}`, exception.stack, 'UnhandledExceptionFilter');
        }

        const errorResponseBody: StandardApiResponse = {
            success: false,
            statusCode,
            message,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString(),
            path: request.raw ? request.raw.url || request.url : request.url,
            traceId,
        };

        response.status(statusCode).send(errorResponseBody);
    }
}
