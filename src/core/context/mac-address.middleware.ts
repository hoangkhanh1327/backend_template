import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AlsContext } from '@/core/context/als.context';

@Injectable()
export class MacAddressMiddleware implements NestMiddleware {
    use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
        const headers = req.headers || {};
        const mac =
            (headers['mac-address'] as string) ||
            (headers['x-mac-address'] as string) ||
            (headers['mac'] as string) ||
            'unknown-mac';

        const store = AlsContext.getStore();
        if (store) {
            store.macAddress = mac;
        }

        next();
    }
}
