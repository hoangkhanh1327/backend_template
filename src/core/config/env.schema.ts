import { z } from 'zod';

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('0.0.0.0'),
    API_PREFIX: z.string().default('api/v1'),
    APP_URL: z.string().default('http://localhost:3000'),

    // Database Configuration
    DB_TYPE: z.enum(['postgres', 'mysql']).default('postgres'),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USERNAME: z.string().default('postgres'),
    DB_PASSWORD: z.string().default('postgres'),
    DB_DATABASE: z.string().default('app_db'),
    DB_SYNCHRONIZE: z.coerce.boolean().default(false),
    DB_LOGGING: z.coerce.boolean().default(false),

    // Redis Configuration
    REDIS_HOST: z.string().default('127.0.0.1'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.coerce.number().default(0),

    // JWT Configuration
    JWT_ACCESS_SECRET: z.string().default('super_secret_access_key_change_me_in_prod'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_key_change_me_in_prod'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),

    // Throttler Rate Limit
    THROTTLE_TTL: z.coerce.number().default(60000),
    THROTTLE_LIMIT: z.coerce.number().default(100),

    // CDN Configurations
    CDN_DOMAIN_LOCAL: z.string().default('http://ctl.vmp.tv'),
    CDN_DOMAIN_PUBLIC: z.string().default('http://ctl.vmp.tv/net'),
    CDN_BASE_URL: z.string().default('https://transcode-cdn.mytv.vn'),
    CDN_API_KEY: z.string().optional(),
    CDN_SECRET: z.string().optional(),

    // SFTP Storage Credentials
    SFTP_HOST: z.string().default('127.0.0.1'),
    SFTP_PORT: z.coerce.number().default(22),
    SFTP_USER: z.string().default('root'),
    SFTP_PASSWORD: z.string().optional(),
    SFTP_REMOTE_ROOT: z.string().default('/uploads'),

    // External API Gateways
    API_GATEWAY_URL: z.string().optional(),
    API_CJM_URL: z.string().optional(),
    API_PORTAL_URL: z.string().optional(),
    API_B2C_URL: z.string().optional(),
    API_SOLR_URL: z.string().optional(),

    // Telegram Alerting Credentials
    TELEGRAM_SELFCARE_URL: z.string().optional(),
    TELEGRAM_SELFCARE_TOKEN: z.string().optional(),
    TELEGRAM_SELFCARE_GROUPID: z.string().optional(),

    // Swagger Documentation Credentials
    USERNAME_SWAGGER: z.string().default('admin'),
    PASSWORD_SWAGGER: z.string().default('admin123'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
    const result = envSchema.safeParse(config);
    if (!result.success) {
        console.error('❌ Invalid environment variables:', result.error.format());
        throw new Error('Environment validation failed');
    }
    return result.data;
}
