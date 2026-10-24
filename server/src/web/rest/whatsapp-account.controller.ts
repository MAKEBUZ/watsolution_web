import { Body, Controller, Delete, Get, Header, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../security';
import { WhatsappAccountService } from '../../service/whatsapp-account.service';

// No logging interceptor: linking codes and phone numbers are private.
@Controller('api/whatsapp/account')
@UseGuards(AuthGuard)
export class WhatsappAccountController {
  constructor(private readonly accounts: WhatsappAccountService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  status(@Req() req: any) {
    return this.accounts.status(req.user.id);
  }
  @Post('link-code')
  @Header('Cache-Control', 'no-store')
  code(@Req() req: any, @Body() body: { phone?: unknown }) {
    return this.accounts.createCode(req.user.id, body?.phone);
  }
  @Patch('notifications')
  preferences(@Req() req: any, @Body() body: { enabled?: unknown }) {
    return this.accounts.preferences(req.user.id, body?.enabled);
  }
  @Delete()
  unlink(@Req() req: any) {
    return this.accounts.unlink(req.user.id);
  }
}
