import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';

import { AlsContext } from '@/core/context/als.context';

@Injectable()
export class PinoLoggerService implements NestLoggerService {
    private readonly logger: pino.Logger;

    constructor() {
        const isDev = process.env.NODE_ENV !== 'production';
        this.logger = pino({
            level: process.env.LOG_LEVEL || 'info',
            formatters: {
                level: (label) => ({ level: label }),
            },
            redact: ['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'creditCard'],
            timestamp: pino.stdTimeFunctions.isoTime,
            transport: isDev
                ? {
                      target: 'pino-pretty',
                      options: {
                          colorize: true,
                          singleLine: true,
                          ignore: 'pid,hostname',
                      },
                  }
                : undefined,
        });
    }

    private enrichContext(context?: string) {
        const traceId = AlsContext.getTraceId();
        const userId = AlsContext.getUserId();
        const hasTrace = traceId && traceId !== 'unknown-trace-id';

        return {
            ...(hasTrace ? { traceId } : {}),
            ...(userId ? { userId } : {}),
            ...(context ? { context } : {}),
        };
    }

    log(message: any, context?: string) {
        this.logger.info(this.enrichContext(context), message);
    }

    error(message: any, trace?: string, context?: string) {
        this.logger.error({ ...this.enrichContext(context), trace }, message);
    }

    warn(message: any, context?: string) {
        this.logger.warn(this.enrichContext(context), message);
    }

    debug(message: any, context?: string) {
        this.logger.debug(this.enrichContext(context), message);
    }

    verbose(message: any, context?: string) {
        this.logger.trace(this.enrichContext(context), message);
    }
}
