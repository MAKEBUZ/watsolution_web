import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post as PostMethod,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReporteDTO } from '../../service/dto/reporte.dto';
import { ReporteService } from '../../service/reporte.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/reportes')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('reportes')
export class ReporteController {
  logger = new Logger('ReporteController');

  constructor(private readonly reporteService: ReporteService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({ status: 200, description: 'List all reportes', type: ReporteDTO })
  async getAll(@Req() req: Request): Promise<ReporteDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.reporteService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({ status: 200, description: 'The found record', type: ReporteDTO })
  async getOne(@Param('id') id: number): Promise<ReporteDTO> {
    return await this.reporteService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create reporte' })
  @ApiResponse({ status: 201, description: 'Created.', type: ReporteDTO })
  async post(@Req() req: Request, @Body() reporteDTO: ReporteDTO): Promise<ReporteDTO> {
    const created = await this.reporteService.save(reporteDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Reporte', created.id);
    return created;
  }

  @Put('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update reporte' })
  @ApiResponse({ status: 200, description: 'Updated.', type: ReporteDTO })
  async putId(@Req() req: Request, @Body() reporteDTO: ReporteDTO): Promise<ReporteDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Reporte', reporteDTO.id);
    return await this.reporteService.update(reporteDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete reporte' })
  @ApiResponse({ status: 204, description: 'Deleted.' })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Reporte', id);
    return await this.reporteService.deleteById(id);
  }
}
