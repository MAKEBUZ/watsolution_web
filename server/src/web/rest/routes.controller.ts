import { Body, Controller, Get, Header, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard, Roles, RoleType } from '../../security';
import { RoutesService } from '../../service/routes.service';
@Controller('api/admin/routes')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}
  @Get('people/:id/geocode')
  @Header('Cache-Control', 'no-store')
  geocode(@Param('id', ParseIntPipe) id: number) {
    return this.routes.geocode(id);
  }
  @Put('people/:id/location') location(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    return this.routes.saveLocation(id, body);
  }
  @Post('plan')
  @Header('Cache-Control', 'no-store')
  plan(@Body() body: unknown) {
    return this.routes.plan(body);
  }
}
