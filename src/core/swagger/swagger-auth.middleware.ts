import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class SwaggerAuthMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) {}

    use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
        const usernameSwagger = this.configService.get<string>('USERNAME_SWAGGER', 'admin');
        const passwordSwagger = this.configService.get<string>('PASSWORD_SWAGGER', 'admin123');

        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Basic ')) {
            const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
            const [user, pass] = credentials.split(':');

            if (user === usernameSwagger && pass === passwordSwagger) {
                return next();
            }
        }

        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger API Documentation"');
        res.statusCode = 401;
        res.end('Unauthorized Swagger Access');
    }
}
