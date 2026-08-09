import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return true;

    if (requiredRoles) {
      const userRoles = user.roles?.map((r: { code: string }) => r.code) || [];
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) return false;
    }

    if (requiredPermissions) {
      const userPermissions = this.extractUserPermissions(user);
      const hasPermission = requiredPermissions.some((p) => userPermissions.includes(p));
      if (!hasPermission) return false;
    }

    return true;
  }

  private extractUserPermissions(user: { roles?: Array<{ permissions?: Array<{ code: string }> }> }): string[] {
    const perms = new Set<string>();
    user.roles?.forEach((role) => {
      role.permissions?.forEach((p) => perms.add(p.code));
    });
    return Array.from(perms);
  }
}
