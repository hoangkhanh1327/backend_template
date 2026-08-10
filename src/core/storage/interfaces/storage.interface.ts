export interface StorageFile {
    fieldname: string;
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

export interface UploadResult {
    url: string;
    key: string;
    filename: string;
    mimetype: string;
    size: number;
}

export interface IStorageService {
    uploadFile(file: StorageFile, folderPath?: string): Promise<UploadResult>;
    deleteFile(keyOrUrl: string): Promise<boolean>;
    getFileUrl(key: string): Promise<string>;
}

export const STORAGE_SERVICE_TOKEN = 'STORAGE_SERVICE_TOKEN';
