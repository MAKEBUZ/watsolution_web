import { ClassSerializerInterceptor, Controller, Get, Logger, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PortalDataDTO } from '../../service/dto/portal-data.dto';
import { PortalService } from '../../service/portal.service';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/portal')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('portal')
export class PortalController {
  logger = new Logger('PortalController');

  constructor(private readonly portalService: PortalService) {}

  @Get('/dashboard')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Get portal dashboard data for logged in user' })
  @ApiResponse({ status: 200, description: 'Portal data', type: PortalDataDTO })
  async getDashboard(@Req() req: Request): Promise<PortalDataDTO> {
    return await this.portalService.getPortalData(req.user?.login);
  }
}
