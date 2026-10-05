import { Body, Controller, Post, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { isWebSession, requireWebOrigin, readRefreshCookie, setRefreshCookie, clearRefreshCookie } from '../../security/web-session';
import { AuthGuard } from '../../security';
import { AuthService } from '../../service/auth.service';
import { SessionService } from '../../service/session.service';

@Controller('api/session')
export class SessionController {
  constructor(private readonly auth: AuthService, private readonly sessions: SessionService) {}

  @Post('/refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response, @Body() body: { refresh_token: string }) {
    if (isWebSession(req)) requireWebOrigin(req);
    const token = isWebSession(req) ? readRefreshCookie(req) : body?.refresh_token;
    if (!token) throw new UnauthorizedException();
    const result = await this.auth.refresh(token);
    if (isWebSession(req)) { setRefreshCookie(res, result.refresh_token); return { id_token: result.id_token }; }
    return result;
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.sessions.revoke(req.user.sessionId, req.user.id);
    clearRefreshCookie(res);
    return { revoked: true };
  }
}
