import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Noticia } from '../domain/noticia.entity';
import { NoticiaController } from '../web/rest/noticia.controller';
import { PublicNoticiasController } from '../web/rest/public-noticias.controller';
import { NoticiaService } from '../service/noticia.service';

@Module({
  imports: [TypeOrmModule.forFeature([Noticia])],
  controllers: [NoticiaController, PublicNoticiasController],
  providers: [NoticiaService],
  exports: [NoticiaService],
})
export class NoticiaModule {}
