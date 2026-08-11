import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '@/core/guards/permissions.decorator';
import { UserPayload } from '@/shared/decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest<{ user: UserPayload }>();
        if (!user || !user.permissions) {
            throw new ForbiddenException('Access denied: User has no permissions');
        }

        const hasPermission = requiredPermissions.every((perm) => user.permissions?.includes(perm));
        if (!hasPermission) {
            throw new ForbiddenException(`Access denied: Missing permissions ${requiredPermissions.join(', ')}`);
        }

        return true;
    }
}
