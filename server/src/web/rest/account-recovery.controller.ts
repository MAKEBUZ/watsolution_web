import { Body, Controller, Header, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles, RoleType, RolesGuard } from '../../security';
import { AccountRecoveryService } from '../../security/account-recovery.service';

@Controller('api/security/accounts')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class AccountRecoveryController {
  constructor(private readonly recovery: AccountRecoveryService) {}
  @Post('/:id/recovery')
  @Header('Cache-Control', 'no-store')
  issue(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.recovery.issue(req.user.id, Number(id), body?.password);
  }
}
