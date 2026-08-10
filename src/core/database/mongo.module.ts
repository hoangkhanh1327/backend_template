import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const uri = configService.get<string>('MONGO_URI');
                if (uri) {
                    return { uri };
                }

                const host = configService.get<string>('MONGO_HOST', 'localhost');
                const port = configService.get<number>('MONGO_PORT', 27017);
                const database = configService.get<string>('MONGO_DATABASE', 'app_db');
                const username = configService.get<string>('MONGO_USERNAME', '');
                const password = configService.get<string>('MONGO_PASSWORD', '');

                const auth = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
                const generatedUri = `mongodb://${auth}${host}:${port}/${database}`;

                return {
                    uri: generatedUri,
                };
            },
        }),
    ],
    exports: [MongooseModule],
})
export class MongoDatabaseModule {}
