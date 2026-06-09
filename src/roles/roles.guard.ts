import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<(number | string)[]>(
      'roles',
      [context.getClass(), context.getHandler()],
    );
    if (!roles.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const userRoles = request.user?.roles || [];
    return roles.some((role) =>
      userRoles.some((userRole) => String(userRole.id) === String(role)),
    );
  }
}
