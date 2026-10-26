import { Body, Controller, Get, Header, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard, Roles, RoleType } from '../../security';
import { WhatsappAdminService } from '../../service/whatsapp-admin.service';

// Never attach the body-logging interceptor: destination numbers are private.
@Controller('api/admin/whatsapp')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class WhatsappAdminController {
  constructor(private readonly admin: WhatsappAdminService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  status(@Req() req: any) {
    return this.admin.status(req.user.id);
  }
  @Post('tests')
  @Header('Cache-Control', 'no-store')
  send(@Req() req: any, @Body() body: { phone?: unknown; type?: unknown; consent?: unknown; requestId?: unknown }) {
    return this.admin.send(req.user.id, body);
  }
}
