import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

import { HttpClientService } from '@/core/http/http-client.service';
import { PinoLoggerService } from '@/core/logger/logger.service';

export interface CdnStreamOptions {
    quality?: string;
    userId?: string;
    deviceId?: string;
    isM3u8?: boolean;
}

export type CdnTranscodeMode = 'enc' | 'stat' | 'none';

export interface CdnPostTranscodeParams {
    zone?: string;
    service: string;
    provider_id: string;
    file: string;
    mode?: CdnTranscodeMode;
    content_id: string;
    part?: string;
    callback: string;
}

export interface CdnTranscodeResult<T = any> {
    request: any;
    response: {
        status: string;
        message?: string;
        download?: T;
    };
}

@Injectable()
export class CdnService {
    private readonly cdnLocalDomain: string;
    private readonly cdnPublicDomain: string;
    private readonly cdnBaseUrl: string;
    private readonly cdnSecret: string;
    private readonly cdnApiKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpClient: HttpClientService,
        private readonly logger: PinoLoggerService,
    ) {
        this.cdnLocalDomain = this.configService.get<string>('CDN_DOMAIN_LOCAL', 'http://cdn-local.internal');
        this.cdnPublicDomain = this.configService.get<string>('CDN_DOMAIN_PUBLIC', 'https://cdn.mytv.vn');
        this.cdnBaseUrl = this.configService.get<string>('CDN_BASE_URL', 'https://transcode-cdn.mytv.vn');
        this.cdnSecret = this.configService.get<string>('CDN_SECRET', 'secret_key');
        this.cdnApiKey = this.configService.get<string>('CDN_API_KEY', 'api_key');
    }

    /**
     * Generates HMAC SHA-512 API Signatures for CDN API authentication
     */
    createApiSign(uri: string, secret = this.cdnSecret): string {
        return createHmac('sha512', secret).update(uri).digest('hex');
    }

    /**
     * Resolves CDN Domain based on Client IP address (Internal Subnet vs Public Internet)
     */
    getCdnDomain(clientIp = ''): string {
        if (this.isInternalIp(clientIp)) {
            return this.cdnLocalDomain;
        }
        return this.cdnPublicDomain;
    }

    /**
     * Checks whether an IP belongs to private/internal subnets (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
     */
    isInternalIp(ip: string): boolean {
        if (!ip) return false;
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4) return false;

        const [p1, p2] = parts;
        if (p1 === 10) return true;
        if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
        if (p1 === 192 && p2 === 168) return true;

        return false;
    }

    /**
     * Constructs standardized CDN streaming URLs for HLS/M3U8 video playback
     */
    buildStreamUrl(contentPath: string, clientIp: string, options: CdnStreamOptions = {}): string {
        const domain = this.getCdnDomain(clientIp);
        let normalizedPath = contentPath.startsWith('/') ? contentPath : `/${contentPath}`;

        if (!normalizedPath.startsWith('/video')) {
            normalizedPath = `/video${normalizedPath}`;
        }

        const qualityParam = options.quality || 'high';
        const extParam = options.isM3u8 !== false ? 'm3u8' : 'mp4';

        const queryParams = new URLSearchParams({
            q: qualityParam,
            ip: clientIp,
            userId: options.userId || '',
            deviceId: options.deviceId || '',
            ext: extParam,
        });

        const fullUrl = `${domain}${normalizedPath}?${queryParams.toString()}`;
        this.logger.debug(`Generated CDN Play URL: ${fullUrl}`, 'CdnService');
        return fullUrl;
    }

    /**
     * Sends transcode requests to CDN Transcoder Server with HMAC SHA-512 signature
     */
    async requestTranscode<T = any>(params: CdnPostTranscodeParams): Promise<CdnTranscodeResult<T>> {
        const nonce = Math.floor(Date.now() / 1000);
        const uri = `/api/v1.1/download`;
        const apiSign = this.createApiSign(uri);

        const apiDomain = this.configService.get<string>('APP_URL', 'http://localhost:3000');
        let callbackUrl = params.callback;
        if (callbackUrl.startsWith('/')) {
            callbackUrl = `${apiDomain.replace(/\/$/, '')}${callbackUrl}`;
        }

        const body = {
            zone: params.zone || '00001',
            service: params.service,
            provider_id: params.provider_id,
            file: params.file,
            mode: params.mode || 'none',
            content_id: params.content_id,
            part: params.part || '1',
            k: this.cdnApiKey,
            nonce: `cdn-post-${nonce}`,
            callback: callbackUrl,
        };

        const targetUrl = `${this.cdnBaseUrl}${uri}`;
        this.logger.log(`Requesting CDN Transcode for contentId: ${params.content_id}, file: ${params.file}`, 'CdnService');

        try {
            const responseData = await this.httpClient.post<any>(targetUrl, body, {
                headers: {
                    apisign: apiSign,
                    'Content-Type': 'application/json',
                },
            });

            return {
                request: body,
                response: responseData,
            };
        } catch (error: any) {
            this.logger.error(`CDN Transcode request failed for contentId: ${params.content_id}: ${error.message}`, error.stack, 'CdnService');
            throw error;
        }
    }
}
