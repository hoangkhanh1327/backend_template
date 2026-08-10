import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

import { AlsContext } from '@/core/context/als.context';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
    use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
        const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
        res.setHeader('x-trace-id', traceId);

        AlsContext.run({ traceId }, () => {
            next();
        });
    }
}
