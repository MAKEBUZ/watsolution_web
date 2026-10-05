import { Body, Controller, Get, Post, Query, Req, UseGuards, UseInterceptors, ClassSerializerInterceptor, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { MobileService } from '../../service/mobile.service';
import { Person } from '../../domain/person.entity';
import { User } from '../../domain/user.entity';

@Controller('api/mobile')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleType.ADMIN, RoleType.OPERATOR)
@UseInterceptors(ClassSerializerInterceptor)
export class MobileController {
  constructor(private readonly mobile: MobileService, private readonly db: DataSource) {}

  @Post('/permit')
  permit(@Req() req: any, @Body() body: { installationId: string }) { return { permit: this.mobile.permit(req.user, body.installationId) }; }

  @Get('/bootstrap')
  bootstrap(@Req() req: any, @Query('after') after?: string) { return this.mobile.bootstrap(req.user, after ? Number(after) : 0); }

  @Post('/sync/push')
  capture(@Req() req: any, @Body() command: unknown) { return this.mobile.capture(req.user, command); }

  @Post('/assign')
  @Roles(RoleType.ADMIN)
  async assign(@Body() body: { personId: number; operatorId: number | null }) {
    if (!Number.isSafeInteger(body.personId) || body.personId < 1 || (body.operatorId !== null && (!Number.isSafeInteger(body.operatorId) || body.operatorId < 1))) throw new BadRequestException();
    if (body.operatorId !== null) {
      const operator = await this.db.getRepository(User).findOne({ where: { id: body.operatorId, activated: true }, relations: { authorities: true } });
      if (!operator?.authorities.some(a => a.name === RoleType.OPERATOR)) throw new BadRequestException('Active operator required');
    }
    await this.db.getRepository(Person).update({ id: body.personId }, { assignedOperatorId: body.operatorId });
    return { assigned: true };
  }
}
