import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClickhouseModule } from './clickhouse.module';
import { MongoDatabaseModule } from './mongo.module';

export const MEMBER_DB_CONNECTION = 'MEMBER_DB';
export const INTERACTIVE_DB_CONNECTION = 'INTERACTIVE_DB';
export const PROMOTION_DB_CONNECTION = 'PROMOTION_DB';
export const SPORTHUB_DB_CONNECTION = 'SPORTHUB_DB';
export const COMIC_DB_CONNECTION = 'COMIC_DB';

@Global()
@Module({
    imports: [
        // Default Connection (Content OTT DB)
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: configService.get<any>('DB_TYPE', 'mysql'),
                host: configService.get<string>('DB_HOST', '127.0.0.1'),
                port: configService.get<number>('DB_PORT', 3306),
                username: configService.get<string>('DB_USERNAME', 'root'),
                password: configService.get<string>('DB_PASSWORD', ''),
                database: configService.get<string>('DB_DATABASE', 'content_ott'),
                autoLoadEntities: true,
                synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
                logging: configService.get<boolean>('DB_LOGGING', false),
            }),
        }),
        // Member DB Connection
        TypeOrmModule.forRootAsync({
            name: MEMBER_DB_CONNECTION,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DATABASE_WRITE_HOST_M', configService.get<string>('DB_HOST', '127.0.0.1')),
                port: configService.get<number>('DATABASE_READ_PORT_M', 3306),
                username: configService.get<string>('DATABASE_READ_USERNAME_M', 'root'),
                password: configService.get<string>('DATABASE_READ_PASSWORD_M', ''),
                database: configService.get<string>('DATABASE_READ_DB_NAME_M', 'ott'),
                autoLoadEntities: true,
                synchronize: false,
                logging: false,
            }),
        }),
        // Interactive DB Connection
        TypeOrmModule.forRootAsync({
            name: INTERACTIVE_DB_CONNECTION,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DATABASE_WRITE_HOST_I', configService.get<string>('DB_HOST', '127.0.0.1')),
                port: 3306,
                username: configService.get<string>('DATABASE_READ_USERNAME_I', 'root'),
                password: configService.get<string>('DATABASE_READ_PASSWORD_I', ''),
                database: configService.get<string>('DATABASE_READ_DB_NAME_I', 'interactive56'),
                autoLoadEntities: true,
                synchronize: false,
                logging: false,
            }),
        }),
        // Promotion DB Connection
        TypeOrmModule.forRootAsync({
            name: PROMOTION_DB_CONNECTION,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DATABASE_WRITE_HOST_P', configService.get<string>('DB_HOST', '127.0.0.1')),
                port: 3306,
                username: configService.get<string>('DATABASE_READ_USERNAME_P', 'root'),
                password: configService.get<string>('DATABASE_READ_PASSWORD_P', ''),
                database: configService.get<string>('DATABASE_READ_DB_NAME_P', 'ott_ads'),
                autoLoadEntities: true,
                synchronize: false,
                logging: false,
            }),
        }),
        // Sporthub DB Connection
        TypeOrmModule.forRootAsync({
            name: SPORTHUB_DB_CONNECTION,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DATABASE_WRITE_HOST_SPORTHUB', configService.get<string>('DB_HOST', '127.0.0.1')),
                port: configService.get<number>('DATABASE_WRITE_PORT_SPORTHUB', 3306),
                username: configService.get<string>('DATABASE_WRITE_USERNAME_SPORTHUB', 'root'),
                password: configService.get<string>('DATABASE_WRITE_PASSWORD_SPORTHUB', ''),
                database: configService.get<string>('DATABASE_WRITE_DB_NAME_SPORTHUB', 'sporthub'),
                autoLoadEntities: true,
                synchronize: false,
                logging: false,
            }),
        }),
        // Comic DB Connection
        TypeOrmModule.forRootAsync({
            name: COMIC_DB_CONNECTION,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DATABASE_COMIC_HOST', configService.get<string>('DB_HOST', '127.0.0.1')),
                port: configService.get<number>('DATABASE_COMIC_PORT', 3306),
                username: configService.get<string>('DATABASE_COMIC_USERNAME', 'root'),
                password: configService.get<string>('DATABASE_COMIC_PASSWORD', ''),
                database: configService.get<string>('DATABASE_COMIC_DB_NAME', 'comic_stage'),
                autoLoadEntities: true,
                synchronize: false,
                logging: false,
            }),
        }),
        ClickhouseModule,
        MongoDatabaseModule,
    ],
    exports: [TypeOrmModule, ClickhouseModule, MongoDatabaseModule],
})
export class DatabaseModule {}
