import { Body, Controller, Get, Post, Req, Res, UseGuards, Header } from '@nestjs/common';
import { AuthGuard } from '../../security';
import { MfaService } from '../../security/mfa.service';
import { AuthService } from '../../service/auth.service';
import { isWebSession, requireWebOrigin, setRefreshCookie } from '../../security/web-session';

@Controller('api/security/mfa')
@UseGuards(AuthGuard)
export class MfaController {
  constructor(
    private readonly mfa: MfaService,
    private readonly auth: AuthService,
  ) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  status(@Req() req: any) {
    return this.mfa.status(req.user.id);
  }
  @Post('/setup')
  @Header('Cache-Control', 'no-store')
  setup(@Req() req: any, @Body() body: any) {
    return this.mfa.setup(req.user.id, body?.password);
  }
  @Post('/confirm')
  @Header('Cache-Control', 'no-store')
  async confirm(@Req() req: any, @Body() body: any, @Res({ passthrough: true }) res: any) {
    if (isWebSession(req)) requireWebOrigin(req);
    const result = await this.mfa.confirm(req.user.id, body?.code);
    const session = await this.auth.sessionAfterMfaEnrollment(req.user.id);
    if (isWebSession(req)) {
      setRefreshCookie(res, session.refresh_token);
      return { ...result, signInRequired: false, id_token: session.id_token };
    }
    return { ...result, signInRequired: false, ...session };
  }
  @Post('/disable')
  @Header('Cache-Control', 'no-store')
  disable(@Req() req: any, @Body() body: any) {
    return this.mfa.disable(req.user.id, body?.password, body?.code);
  }
}
