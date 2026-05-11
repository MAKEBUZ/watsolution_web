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
import { MeterDTO } from '../../service/dto/meter.dto';
import { MeterService } from '../../service/meter.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/meters')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('meters')
export class MeterController {
  logger = new Logger('MeterController');

  constructor(private readonly meterService: MeterService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: MeterDTO,
  })
  async getAll(@Req() req: Request): Promise<MeterDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.meterService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/by-person/:personId')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Get all meter readings for a person' })
  @ApiResponse({ status: 200, description: 'Meter readings for the person', type: MeterDTO })
  async getByPerson(@Param('personId') personId: number): Promise<MeterDTO[]> {
    const [results] = await this.meterService.findAndCount({
      where: { person: { id: +personId } } as any,
      order: { readingDate: 'DESC' } as any,
      take: 100,
    });
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: MeterDTO,
  })
  async getOne(@Param('id') id: number): Promise<MeterDTO> {
    return await this.meterService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create meter' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: MeterDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() meterDTO: MeterDTO): Promise<MeterDTO> {
    const created = await this.meterService.save(meterDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Meter', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update meter' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: MeterDTO,
  })
  async put(@Req() req: Request, @Body() meterDTO: MeterDTO): Promise<MeterDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Meter', meterDTO.id);
    return await this.meterService.update(meterDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update meter with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: MeterDTO,
  })
  async putId(@Req() req: Request, @Body() meterDTO: MeterDTO): Promise<MeterDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Meter', meterDTO.id);
    return await this.meterService.update(meterDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete meter' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Meter', id);
    return await this.meterService.deleteById(id);
  }
}
