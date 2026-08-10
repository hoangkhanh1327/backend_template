import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserPayload } from '@/modules/auth/decorators/current-user.decorator';
import { ROLES_KEY } from '@/modules/auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest<{ user: UserPayload }>();
        if (!user || !user.roles) {
            throw new ForbiddenException('Access denied: User has no assigned roles');
        }

        const hasRole = requiredRoles.some((role) => user.roles.includes(role));
        if (!hasRole) {
            throw new ForbiddenException(`Access denied: Requires role ${requiredRoles.join(', ')}`);
        }

        return true;
    }
}
