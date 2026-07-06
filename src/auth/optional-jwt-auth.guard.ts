import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like AuthGuard('jwt') but never rejects the request. `req.user` is the
 * decoded JWT payload when a valid bearer token is present, otherwise null.
 * Used on routes that serve both public and authenticated callers (e.g. a
 * course catalog that shows more to admins/owners than to anonymous users).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    return user || null;
  }
}
