import { Injectable, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { AlsContext } from '@/core/context/als.context';
import { PinoLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class HttpClientService implements OnModuleInit {
    private client: AxiosInstance;

    constructor(private readonly logger: PinoLoggerService) {}

    onModuleInit() {
        this.client = axios.create({
            timeout: 30000, // 30s timeout
        });

        // Request Interceptor: Automatically inject Correlation TraceID
        this.client.interceptors.request.use((config) => {
            const traceId = AlsContext.getTraceId();
            config.headers['x-trace-id'] = traceId;
            (config as any).metadata = { startTime: Date.now() };

            this.logger.debug(`[External HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, 'HttpClientService');
            return config;
        });

        // Response Interceptor: Log duration & errors
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                const duration = Date.now() - ((response.config as any).metadata?.startTime || Date.now());
                this.logger.debug(
                    `[External HTTP Response] ${response.config.method?.toUpperCase()} ${response.config.url} ${response.status} - ${duration}ms`,
                    'HttpClientService',
                );
                return response;
            },
            (error) => {
                const config = error.config || {};
                const duration = Date.now() - (config.metadata?.startTime || Date.now());
                this.logger.error(
                    `[External HTTP Error] ${config.method?.toUpperCase()} ${config.url} ${error.response?.status || 'FAIL'} - ${duration}ms: ${error.message}`,
                    error.stack,
                    'HttpClientService',
                );
                return Promise.reject(error);
            },
        );
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}
