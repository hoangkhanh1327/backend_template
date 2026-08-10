import { IBaseRepository } from '@/core/database/ibase.repository';
import { AuditLogEntity } from '@/modules/audit-logs/entities/audit-log.entity';

export interface IAuditLogRepository extends IBaseRepository<AuditLogEntity> {
    findWithFilter(query: any): Promise<[AuditLogEntity[], number]>;
}
