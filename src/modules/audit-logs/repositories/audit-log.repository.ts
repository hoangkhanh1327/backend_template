import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { BaseRepository } from '@/core/database/base.repository';
import { AuditLogEntity } from '@/modules/audit-logs/entities/audit-log.entity';
import { IAuditLogRepository } from '@/modules/audit-logs/repositories/audit-log.repository.interface';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLogEntity> implements IAuditLogRepository {
    constructor(
        @InjectRepository(AuditLogEntity)
        private readonly auditLogTypeOrmRepo: Repository<AuditLogEntity>,
    ) {
        super(AuditLogEntity, auditLogTypeOrmRepo);
    }

    async findWithFilter(query: any): Promise<[AuditLogEntity[], number]> {
        const { module, action, userId, startDate, endDate, page = 1, limit = 10 } = query;
        const where: any = {};

        if (module) where.module = module;
        if (action) where.action = action;
        if (userId) where.userId = userId;
        if (startDate && endDate) {
            where.createdAt = Between(new Date(startDate), new Date(endDate));
        }

        return this.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
}
