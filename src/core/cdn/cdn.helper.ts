import { createHmac } from 'crypto';

export class CdnHelper {
    /**
     * Generates signed URL tokens for secure OTT stream playback
     */
    static generateStreamToken(url: string, secretKey: string, ttlSeconds = 3600): string {
        const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
        const hash = createHmac('sha256', secretKey).update(`${url}:${expires}`).digest('hex');

        return `${url}?token=${hash}&expires=${expires}`;
    }

    /**
     * Formats streaming path for HLS/M3U8 master playlists
     */
    static formatPlaylistUrl(cdnDomain: string, relativePath: string): string {
        const cleanDomain = cdnDomain.replace(/\/$/, '');
        const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        return `${cleanDomain}${cleanPath}`;
    }
}
