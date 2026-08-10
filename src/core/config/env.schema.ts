import { z } from 'zod';

export const envSchema = z.object({
    // App Base Configuration
    NODE_ENV: z.enum(['development', 'production', 'staging', 'test', 'local', 'pilot']).default('development'),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('0.0.0.0'),
    API_PREFIX: z.string().default('api/v1'),
    APP_URL: z.string().default('http://localhost:3000'),
    APP_WELCOME: z.string().optional(),
    APP_PORT: z.coerce.number().optional(),
    BASE_URL: z.string().optional(),
    DOMAIN_API: z.string().optional(),
    SECRET: z.string().default('smart_cms'),
    PRIVATE_KEY: z.string().optional(),
    CONNECT_TIMEOUT: z.coerce.number().default(5000),
    SERVER_TIMEOUT: z.coerce.number().default(1080000),

    // Main Database Configuration (TypeORM)
    DB_TYPE: z.enum(['postgres', 'mysql']).default('mysql'),
    DB_HOST: z.string().default('127.0.0.1'),
    DB_PORT: z.coerce.number().default(3306),
    DB_USERNAME: z.string().default('root'),
    DB_PASSWORD: z.string().default('root'),
    DB_DATABASE: z.string().default('content_ott'),
    DB_SYNCHRONIZE: z.coerce.boolean().default(false),
    DB_LOGGING: z.coerce.boolean().default(false),

    // Subsystem MySQL Databases (Member, Interactive, Promotion, B2B, Short, etc.)
    DATABASE_READ_HOST_M: z.string().optional(),
    DATABASE_READ_PORT_M: z.coerce.number().optional(),
    DATABASE_READ_USERNAME_M: z.string().optional(),
    DATABASE_READ_PASSWORD_M: z.string().optional(),
    DATABASE_READ_DB_NAME_M: z.string().optional(),
    DATABASE_WRITE_HOST_M: z.string().optional(),

    DATABASE_READ_HOST_I: z.string().optional(),
    DATABASE_WRITE_HOST_I: z.string().optional(),
    DATABASE_READ_HOST_P: z.string().optional(),
    DATABASE_WRITE_HOST_P: z.string().optional(),
    DATABASE_READ_HOST_B2B: z.string().optional(),
    DATABASE_WRITE_HOST_B2B: z.string().optional(),
    DATABASE_WRITE_HOST_SHORT: z.string().optional(),
    DATABASE_WRITE_HOST_COMINGSOON: z.string().optional(),
    DATABASE_WRITE_HOST_TK: z.string().optional(),
    DATABASE_WRITE_HOST_LOYALTY: z.string().optional(),
    DATABASE_COMIC_HOST: z.string().optional(),
    DATABASE_WRITE_HOST_LIVESCORE: z.string().optional(),
    DATABASE_WRITE_HOST_SPORTHUB: z.string().optional(),
    DATABASE_WRITE_HOST_MEMBER_INFO: z.string().optional(),
    DATABASE_DOI_SOAT_HOST_C: z.string().optional(),

    // Primary ClickHouse Configuration (Report)
    CLICKHOUSE_HOST: z.string().default('127.0.0.1'),
    CLICKHOUSE_PORT: z.coerce.number().default(8123),
    CLICKHOUSE_USERNAME: z.string().default('default'),
    CLICKHOUSE_PASSWORD: z.string().default(''),
    CLICKHOUSE_DATABASE: z.string().default('default'),
    CLICKHOUSE_PROTOCOL: z.enum(['http', 'https']).default('http'),

    // Behavior ClickHouse Configuration
    DATABASE_CLICKHOUSE_BEHAVIOR_HOST: z.string().optional(),
    DATABASE_CLICKHOUSE_BEHAVIOR_PORT: z.coerce.number().optional(),
    DATABASE_CLICKHOUSE_BEHAVIOR_USERNAME: z.string().optional(),
    DATABASE_CLICKHOUSE_BEHAVIOR_PASSWORD: z.string().optional(),
    DATABASE_CLICKHOUSE_BEHAVIOR_NAME: z.string().optional(),

    // Realtime Log ClickHouse Configuration
    DATABASE_CLICKHOUSE_LOG_REALTIME_HOST: z.string().optional(),
    DATABASE_CLICKHOUSE_LOG_REALTIME_PORT: z.coerce.number().optional(),
    DATABASE_CLICKHOUSE_LOG_REALTIME_USERNAME: z.string().optional(),
    DATABASE_CLICKHOUSE_LOG_REALTIME_PASSWORD: z.string().optional(),
    DATABASE_CLICKHOUSE_LOG_REALTIME_NAME: z.string().optional(),

    // MongoDB Configuration
    MONGO_URI: z.string().optional(),
    MONGO_HOST: z.string().default('127.0.0.1'),
    MONGO_PORT: z.coerce.number().default(27017),
    MONGO_USERNAME: z.string().default(''),
    MONGO_PASSWORD: z.string().default(''),
    MONGO_DATABASE: z.string().default('app_db'),
    DATABASE_LOG_HOST: z.string().optional(),
    DATABASE_LOG_PORT: z.coerce.number().optional(),
    DATABASE_LOG_USERNAME: z.string().optional(),
    DATABASE_LOG_PASSWORD: z.string().optional(),
    DATABASE_LOG_NAME: z.string().optional(),

    // Primary Redis Configuration
    REDIS_HOST: z.string().default('127.0.0.1'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.coerce.number().default(0),

    // Additional Redis Clusters (Data & Promotion)
    REDIS_DATA_HOST: z.string().optional(),
    REDIS_DATA_PORT: z.coerce.number().optional(),
    REDIS_DATA_PASS: z.string().optional(),
    REDIS_DATA_VALUE: z.coerce.number().optional(),

    REDIS_PROMOTION_HOST: z.string().optional(),
    REDIS_PROMOTION_PORT: z.coerce.number().optional(),
    REDIS_PROMOTION_PASS: z.string().optional(),
    REDIS_PROMOTION_VALUE: z.coerce.number().optional(),

    // JWT Security
    JWT_ACCESS_SECRET: z.string().default('super_secret_access_key_change_me_in_prod'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_key_change_me_in_prod'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),

    // DRM & Security Keys
    VMX_TOKEN_API: z.string().optional(),
    DRM_TODAY_CERT_URL: z.string().optional(),
    DRM_TODAY_QNET_OPERATOR_ID: z.coerce.number().optional(),
    DRM_TODAY_QNET_JWT_KEY: z.string().optional(),
    DRM_TODAY_QNET_SECRET_KEY: z.string().optional(),
    DRM_TODAY_HBO_GO_OPERATOR_ID: z.coerce.number().optional(),
    DRM_TODAY_HBO_GO_JWT_KEY: z.string().optional(),
    DRM_TODAY_HBO_GO_SECRET_KEY: z.string().optional(),
    DRM_TODAY_LICENSE_URL: z.string().optional(),
    DRM_TODAY_LICENSE_ANDROID_URL: z.string().optional(),
    CMS_IO_FILE_ROOT: z.string().optional(),
    CMS_IO_KEY_ID: z.string().optional(),
    CMS_IO_PUBLIC_KEY: z.string().optional(),

    // Rate Limiting
    THROTTLE_TTL: z.coerce.number().default(60000),
    THROTTLE_LIMIT: z.coerce.number().default(100),
    RATELIMIT_TTL: z.coerce.number().optional(),
    RATELIMIT_LIMIT_USER: z.coerce.number().optional(),

    // CDN Configurations
    CDN_DOMAIN_LOCAL: z.string().default('http://ctl.vmp.tv'),
    CDN_DOMAIN_PUBLIC: z.string().default('http://ctl.vmp.tv/net'),
    CDN_DOMAIN_CHECK_CCU: z.string().optional(),
    CDN_BASE_URL: z.string().default('https://transcode-cdn.mytv.vn'),
    CDN_API_KEY: z.string().optional(),
    CDN_SECRET: z.string().optional(),

    // SFTP Storage Credentials
    SFTP_HOST: z.string().default('127.0.0.1'),
    SFTP_PORT: z.coerce.number().default(22),
    SFTP_USER: z.string().default('root'),
    SFTP_PASSWORD: z.string().optional(),
    SFTP_REMOTE_ROOT: z.string().default('/uploads'),

    // External API Gateways & Service Endpoints
    API_CCU: z.string().optional(),
    API_SOCKET: z.string().optional(),
    API_CHECK_MOBILE: z.string().optional(),
    API_PORTAL_URL: z.string().optional(),
    API_GATEWAY_URL: z.string().optional(),
    API_CJM_URL: z.string().optional(),
    API_K8S_URL: z.string().optional(),
    API_B2C_URL: z.string().optional(),
    API_CMS_OLD_URL: z.string().optional(),
    API_SOLR_URL: z.string().optional(),
    API_SOLR_V2_URL: z.string().optional(),
    API_SOLR_SUGGEST_V2_URL: z.string().optional(),
    URL_PLAY_V2: z.string().optional(),
    API_HST_URL: z.string().optional(),
    API_COMMON: z.string().optional(),
    API_AI_SUBTITLE: z.string().optional(),
    API_SPORTHUB_REDIS: z.string().optional(),

    // Cookie & Upload Configurations
    COOKIE_EXPIRED: z.coerce.number().optional(),
    COOKIE_SUB_DOMAIN: z.string().optional(),
    DESTINATION: z.string().optional(),

    // Telegram Alerting Credentials
    TELEGRAM_SELFCARE_URL: z.string().optional(),
    TELEGRAM_SELFCARE_TOKEN: z.string().optional(),
    TELEGRAM_SELFCARE_GROUPID: z.string().optional(),

    // Swagger Documentation Auth
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
