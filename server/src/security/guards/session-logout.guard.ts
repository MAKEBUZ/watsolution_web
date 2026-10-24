import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { isWebSession, requireWebOrigin } from '../web-session';

@Injectable()
export class SessionLogoutGuard extends AuthGuard {
  canActivate(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest();
    if (isWebSession(request)) {
      requireWebOrigin(request);
      return true;
    }
    // Possession is checked by revokeByRefresh, including already-rotated tokens.
    // This permits logout after the access token expires, without cookie authority.
    if (typeof request.body?.refresh_token === 'string' && request.body.refresh_token.length <= 256) return true;
    return super.canActivate(context);
  }
}
