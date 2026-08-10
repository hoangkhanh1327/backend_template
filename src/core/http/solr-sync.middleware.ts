import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FastifyReply, FastifyRequest } from 'fastify';

import { PinoLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class SolrSyncMiddleware implements NestMiddleware {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: PinoLoggerService,
    ) {}

    use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
        const method = req.method?.toUpperCase() || 'GET';
        const url = req.url || '';

        const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        const contentRoutes = ['/movie', '/channel', '/vod', '/cartoon', '/comic', '/sporthub'];

        const isContentRoute = contentRoutes.some((route) => url.includes(route));

        if (isContentRoute && mutationMethods.includes(method)) {
            const solrUrl = this.configService.get<string>('API_SOLR_V2_URL');

            if (solrUrl) {
                // Fire and forget SOLR sync request asynchronously
                axios
                    .post(`${solrUrl}/sync-index`, {
                        url,
                        method,
                        timestamp: new Date().toISOString(),
                    })
                    .then(() => this.logger.log(`SOLR sync triggered for ${method} ${url}`, 'SolrSyncMiddleware'))
                    .catch((err) => this.logger.error(`SOLR sync failed: ${err.message}`, err.stack, 'SolrSyncMiddleware'));
            }
        }

        next();
    }
}
