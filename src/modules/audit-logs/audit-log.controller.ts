import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuditLogService } from '@/modules/audit-logs/audit-log.service';
import { FilterAuditLogDto } from '@/modules/audit-logs/dto/filter-audit-log.dto';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get paginated audit logs (ADMIN only)' })
    async getLogs(@Query() query: FilterAuditLogDto) {
        return this.auditLogService.getLogs(query);
    }
}
