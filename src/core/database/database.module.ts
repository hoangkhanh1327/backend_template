import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: configService.get<any>('DB_TYPE', 'postgres'),
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 5432),
                username: configService.get<string>('DB_USERNAME', 'postgres'),
                password: configService.get<string>('DB_PASSWORD', 'postgres'),
                database: configService.get<string>('DB_DATABASE', 'app_db'),
                autoLoadEntities: true,
                synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
                logging: configService.get<boolean>('DB_LOGGING', false),
            }),
        }),
    ],
})
export class DatabaseModule {}
