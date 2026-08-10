import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import FastifyMulter from 'fastify-multer';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FieldUploadConfig {
    name: string;
    maxCount?: number;
}

export interface UploadOptions {
    folder?: string;
    allowedMimetypes?: string[];
    maxSizeMb?: number;
}

const defaultImageFilter = (req: any, file: any, callback: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};

export function UploadFields(fields: FieldUploadConfig[], options: UploadOptions = {}) {
    const folder = options.folder || 'general';
    const uploadRoot = path.resolve(process.cwd(), 'public', 'uploads');

    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        UseInterceptors(
            (FastifyMulter as any)({
                storage: diskStorage({
                    destination(req, file, callback) {
                        const now = new Date();
                        const yearMonth = `${now.getFullYear()}/${now.getMonth() + 1}`;
                        const targetPath = path.join(uploadRoot, folder, yearMonth);
                        if (!fs.existsSync(targetPath)) {
                            fs.mkdirSync(targetPath, { recursive: true });
                        }
                        callback(null, targetPath);
                    },
                    filename(req, file, callback) {
                        const ext = path.extname(file.originalname);
                        callback(null, `${uuidv4()}${ext}`);
                    },
                }),
                fileFilter: defaultImageFilter,
                limits: {
                    fileSize: (options.maxSizeMb || 10) * 1024 * 1024,
                },
            }).fields(fields.map((f) => ({ name: f.name, maxCount: f.maxCount || 1 }))),
        ),
    );
}
