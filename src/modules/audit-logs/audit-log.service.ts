import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { FilterAuditLogDto } from '@/modules/audit-logs/dto/filter-audit-log.dto';
import { AuditLogEntity } from '@/modules/audit-logs/entities/audit-log.entity';
import { PaginatedResultDto } from '@/shared/dtos/pagination.dto';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLogEntity)
        private readonly auditLogRepo: Repository<AuditLogEntity>,
    ) {}

    async createLog(payload: Partial<AuditLogEntity>): Promise<AuditLogEntity> {
        const log = this.auditLogRepo.create(payload);
        return this.auditLogRepo.save(log);
    }

    async getLogs(query: FilterAuditLogDto): Promise<PaginatedResultDto<AuditLogEntity>> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.userId) where.userId = query.userId;
        if (query.action) where.action = Like(`%${query.action}%`);
        if (query.module) where.module = query.module;

        const [items, totalItems] = await this.auditLogRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

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
