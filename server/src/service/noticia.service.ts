import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Noticia } from '../domain/noticia.entity';
import { NoticiaStatus } from '../domain/enumeration/noticia-status';
import { NoticiaDTO } from '../service/dto/noticia.dto';
import { NoticiaMapper } from '../service/mapper/noticia.mapper';

@Injectable()
export class NoticiaService {
  logger = new Logger('NoticiaService');

  constructor(@InjectRepository(Noticia) private noticiaRepository: Repository<Noticia>) {}

  async findById(id: number): Promise<NoticiaDTO | undefined> {
    const result = await this.noticiaRepository.findOne({ where: { id } });
    return NoticiaMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<NoticiaDTO>): Promise<NoticiaDTO | undefined> {
    const result = await this.noticiaRepository.findOne(options);
    return NoticiaMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<NoticiaDTO>): Promise<[NoticiaDTO[], number]> {
    const resultList = await this.noticiaRepository.findAndCount(options);
    const noticiaDTO: NoticiaDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(noticia => noticiaDTO.push(NoticiaMapper.fromEntityToDTO(noticia)));
      resultList[0] = noticiaDTO;
    }
    return resultList;
  }

  async findActive(): Promise<NoticiaDTO[]> {
    const results = await this.noticiaRepository.find({
      where: { status: NoticiaStatus.ACTIVE },
      order: { publishDate: 'DESC' },
    });
    return results.map(n => NoticiaMapper.fromEntityToDTO(n));
  }

  async save(noticiaDTO: NoticiaDTO, creator?: string): Promise<NoticiaDTO | undefined> {
    const entity = NoticiaMapper.fromDTOtoEntity(noticiaDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.noticiaRepository.save(entity);
    return NoticiaMapper.fromEntityToDTO(result);
  }

  async update(noticiaDTO: NoticiaDTO, updater?: string): Promise<NoticiaDTO | undefined> {
    const entity = NoticiaMapper.fromDTOtoEntity(noticiaDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.noticiaRepository.save(entity);
    return NoticiaMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.noticiaRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
