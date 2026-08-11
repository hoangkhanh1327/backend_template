import { ClickHouseClient, createClient } from '@clickhouse/client';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const CLICKHOUSE_CLIENT = 'CLICKHOUSE_CLIENT';
export const CLICKHOUSE_BEHAVIOR_CLIENT = 'CLICKHOUSE_BEHAVIOR_CLIENT';
export const CLICKHOUSE_LOG_REALTIME_CLIENT = 'CLICKHOUSE_LOG_REALTIME_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: CLICKHOUSE_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): ClickHouseClient => {
                const host = configService.get<string>('CLICKHOUSE_HOST', '127.0.0.1');
                const port = configService.get<number>('CLICKHOUSE_PORT', 8123);
                const username = configService.get<string>('CLICKHOUSE_USERNAME', 'click_apireport');
                const password = configService.get<string>('CLICKHOUSE_PASSWORD', '');
                const database = configService.get<string>('CLICKHOUSE_DATABASE', 'clickhouse_report');
                const protocol = configService.get<string>('CLICKHOUSE_PROTOCOL', 'http');

                return createClient({
                    url: `${protocol}://${host}:${port}`,
                    username,
                    password,
                    database,
                    application: 'backend-template-v2-report',
                });
            },
        },
        {
            provide: CLICKHOUSE_BEHAVIOR_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): ClickHouseClient => {
                const host = configService.get<string>(
                    'DATABASE_CLICKHOUSE_BEHAVIOR_HOST',
                    configService.get<string>('CLICKHOUSE_HOST', '127.0.0.1'),
                );
                const port = configService.get<number>('DATABASE_CLICKHOUSE_BEHAVIOR_PORT', 8123);
                const username = configService.get<string>('DATABASE_CLICKHOUSE_BEHAVIOR_USERNAME', 'user_behavior');
                const password = configService.get<string>('DATABASE_CLICKHOUSE_BEHAVIOR_PASSWORD', '');
                const database = configService.get<string>('DATABASE_CLICKHOUSE_BEHAVIOR_NAME', 'clickhouse_behavior');
                const protocol = configService.get<string>('CLICKHOUSE_PROTOCOL', 'http');

                return createClient({
                    url: `${protocol}://${host}:${port}`,
                    username,
                    password,
                    database,
                    application: 'backend-template-v2-behavior',
                });
            },
        },
        {
            provide: CLICKHOUSE_LOG_REALTIME_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): ClickHouseClient => {
                const host = configService.get<string>(
                    'DATABASE_CLICKHOUSE_LOG_REALTIME_HOST',
                    configService.get<string>('CLICKHOUSE_HOST', '127.0.0.1'),
                );
                const port = configService.get<number>('DATABASE_CLICKHOUSE_LOG_REALTIME_PORT', 8123);
                const username = configService.get<string>('DATABASE_CLICKHOUSE_LOG_REALTIME_USERNAME', 'api_realtime');
                const password = configService.get<string>('DATABASE_CLICKHOUSE_LOG_REALTIME_PASSWORD', '');
                const database = configService.get<string>('DATABASE_CLICKHOUSE_LOG_REALTIME_NAME', 'log_realtime');
                const protocol = configService.get<string>('CLICKHOUSE_PROTOCOL', 'http');

                return createClient({
                    url: `${protocol}://${host}:${port}`,
                    username,
                    password,
                    database,
                    application: 'backend-template-v2-realtime-log',
                });
            },
        },
    ],
    exports: [CLICKHOUSE_CLIENT, CLICKHOUSE_BEHAVIOR_CLIENT, CLICKHOUSE_LOG_REALTIME_CLIENT],
})
export class ClickhouseModule {}
