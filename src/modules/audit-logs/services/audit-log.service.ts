import { Inject, Injectable } from '@nestjs/common';

import { FilterAuditLogDto } from '@/modules/audit-logs/dto/filter-audit-log.dto';
import { AuditLogEntity } from '@/modules/audit-logs/entities/audit-log.entity';
import { IAuditLogRepository } from '@/modules/audit-logs/repositories/audit-log.repository.interface';
import { PaginatedResultDto } from '@/shared/dtos/pagination.dto';

export const AUDIT_LOG_REPOSITORY_TOKEN = 'AUDIT_LOG_REPOSITORY_TOKEN';

@Injectable()
export class AuditLogService {
    constructor(
        @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
        private readonly auditLogRepo: IAuditLogRepository,
    ) {}

    async createLog(payload: Partial<AuditLogEntity>): Promise<AuditLogEntity> {
        return this.auditLogRepo.save(payload);
    }

    async getLogs(query: FilterAuditLogDto): Promise<PaginatedResultDto<AuditLogEntity>> {
        const [items, totalItems] = await this.auditLogRepo.findWithFilter(query);
        const page = query.page || 1;
        const limit = query.limit || 10;

        return {
            items,
            totalItems,
            itemCount: items.length,
            itemsPerPage: limit,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }
}
