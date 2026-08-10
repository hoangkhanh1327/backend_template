import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'audit_log_metadata';

export interface AuditLogMetadata {
    module: string;
    action: string;
    description?: string;
}

export const AuditLog = (metadata: AuditLogMetadata) => SetMetadata(AUDIT_LOG_KEY, metadata);
