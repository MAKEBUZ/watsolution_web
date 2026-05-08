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
import { NoticiaDTO } from '../../service/dto/noticia.dto';
import { NoticiaService } from '../../service/noticia.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/noticias')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('noticias')
export class NoticiaController {
  logger = new Logger('NoticiaController');

  constructor(private readonly noticiaService: NoticiaService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({ status: 200, description: 'List all noticias', type: NoticiaDTO })
  async getAll(@Req() req: Request): Promise<NoticiaDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.noticiaService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({ status: 200, description: 'The found record', type: NoticiaDTO })
  async getOne(@Param('id') id: number): Promise<NoticiaDTO> {
    return await this.noticiaService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create noticia' })
  @ApiResponse({ status: 201, description: 'Created.', type: NoticiaDTO })
  async post(@Req() req: Request, @Body() noticiaDTO: NoticiaDTO): Promise<NoticiaDTO> {
    const created = await this.noticiaService.save(noticiaDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Noticia', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update noticia' })
  @ApiResponse({ status: 200, description: 'Updated.', type: NoticiaDTO })
  async put(@Req() req: Request, @Body() noticiaDTO: NoticiaDTO): Promise<NoticiaDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Noticia', noticiaDTO.id);
    return await this.noticiaService.update(noticiaDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update noticia with id' })
  @ApiResponse({ status: 200, description: 'Updated.', type: NoticiaDTO })
  async putId(@Req() req: Request, @Body() noticiaDTO: NoticiaDTO): Promise<NoticiaDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Noticia', noticiaDTO.id);
    return await this.noticiaService.update(noticiaDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete noticia' })
  @ApiResponse({ status: 204, description: 'Deleted.' })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Noticia', id);
    return await this.noticiaService.deleteById(id);
  }
}
