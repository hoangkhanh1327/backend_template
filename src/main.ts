import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/core/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@/core/interceptors/logging.interceptor';
import { TransformInterceptor } from '@/core/interceptors/transform.interceptor';
import { PinoLoggerService } from '@/core/logger/logger.service';

async function bootstrap() {
    const adapter = new FastifyAdapter({
        logger: false, // Managed by PinoLoggerService
    });

    await adapter.register(fastifyMultipart);

    const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

    const logger = app.get(PinoLoggerService);
    app.useLogger(logger);

    // Set API Prefix
    app.setGlobalPrefix('api/v1');

    // Global Validation Pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Global Interceptors & Exception Filter
    app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor(logger));
    app.useGlobalFilters(new AllExceptionsFilter(logger));

    // Swagger Documentation Setup
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Backend Template API V2')
        .setDescription('Modular Clean Architecture & DDD Backend Framework')
        .setVersion('2.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen(port, host);
    logger.log(`🚀 Application running on: http://${host}:${port}/api/v1`, 'Bootstrap');
    logger.log(`📖 Swagger API Docs available on: http://${host}:${port}/docs`, 'Bootstrap');
}

bootstrap();
