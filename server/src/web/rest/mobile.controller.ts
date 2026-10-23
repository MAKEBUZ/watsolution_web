import { Body, Controller, Get, Post, Query, Req, UseGuards, UseInterceptors, ClassSerializerInterceptor, BadRequestException, NotFoundException } from '@nestjs/common';
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

  @Post('/access/check')
  access(@Req() req: any, @Body() body: { personIds: number[] }) {
    return this.mobile.access(req.user, body?.personIds);
  }

  @Post('/assign')
  @Roles(RoleType.ADMIN)
  async assign(@Body() body: { personId: number; operatorId: number | null }) {
    if (!body || Object.keys(body).some(key => !['personId', 'operatorId'].includes(key)) || !Number.isSafeInteger(body.personId) || body.personId < 1 || (body.operatorId !== null && (!Number.isSafeInteger(body.operatorId) || body.operatorId < 1))) throw new BadRequestException();
    return this.db.transaction(async manager => {
      // Use the same row lock as capture: assignment and submission cannot
      // race past one another's authorization decision.
      const people = manager.getRepository(Person);
      const person = await people.findOne({ where: { id: body.personId }, lock: { mode: 'pessimistic_write' } });
      if (!person) throw new NotFoundException('Person not found');
      if (body.operatorId !== null) {
        const operator = await manager.getRepository(User).findOne({ where: { id: body.operatorId, activated: true }, relations: { authorities: true } });
        if (!operator?.authorities.some(a => a.name === RoleType.OPERATOR)) throw new BadRequestException('Active operator required');
      }
      await people.update({ id: body.personId }, { assignedOperatorId: body.operatorId });
      return { assigned: true };
    });
  }

  @Get('/operators')
  @Roles(RoleType.ADMIN)
  async operators(@Query('after') after = '0') {
    const cursor = Number(after);
    if (!Number.isSafeInteger(cursor) || cursor < 0) throw new BadRequestException();
    const rows = await this.db.getRepository(User).createQueryBuilder('operator')
      .innerJoin('operator.authorities', 'authority')
      .select(['operator.id', 'operator.login'])
      .where('operator.activated = :active', { active: true })
      .andWhere('authority.name = :role', { role: RoleType.OPERATOR })
      .andWhere('operator.id > :cursor', { cursor })
      .orderBy('operator.id', 'ASC').take(101).getMany();
    const operators = rows.slice(0, 100).map(user => ({ id: user.id, login: user.login }));
    return { operators, next: rows.length > 100 ? operators[operators.length - 1].id : null };
  }
}
