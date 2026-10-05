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
    return super.canActivate(context);
  }
}
