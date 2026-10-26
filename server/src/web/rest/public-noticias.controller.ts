import { NoticiaStatus } from '../../domain/enumeration/noticia-status';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoticiaDTO } from '../../service/dto/noticia.dto';
import { NoticiaService } from '../../service/noticia.service';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/public')
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiTags('public')
export class PublicNoticiasController {
  logger = new Logger('PublicNoticiasController');

  constructor(private readonly noticiaService: NoticiaService) {}

  @Get('/noticias')
  @ApiResponse({ status: 200, description: 'List active noticias (public)', type: NoticiaDTO })
  async getActiveNoticias(): Promise<NoticiaDTO[]> {
    return await this.noticiaService.findActive();
  }

  @Get('/noticias/:id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const item = await this.noticiaService.findById(id);
    if (!item || item.status !== NoticiaStatus.ACTIVE) throw new NotFoundException('La noticia no está publicada.');
    return item;
  }
}
