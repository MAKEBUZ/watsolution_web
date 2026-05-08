import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Reporte } from '../domain/reporte.entity';
import { ReporteDTO } from '../service/dto/reporte.dto';
import { ReporteMapper } from '../service/mapper/reporte.mapper';

const relations = {
  person: true,
} as const;

@Injectable()
export class ReporteService {
  logger = new Logger('ReporteService');

  constructor(@InjectRepository(Reporte) private reporteRepository: Repository<Reporte>) {}

  async findById(id: number): Promise<ReporteDTO | undefined> {
    const result = await this.reporteRepository.findOne({ relations, where: { id } });
    return ReporteMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<ReporteDTO>): Promise<ReporteDTO | undefined> {
    const result = await this.reporteRepository.findOne(options);
    return ReporteMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<ReporteDTO>): Promise<[ReporteDTO[], number]> {
    const resultList = await this.reporteRepository.findAndCount({ ...options, relations });
    const reporteDTO: ReporteDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(reporte => reporteDTO.push(ReporteMapper.fromEntityToDTO(reporte)));
      resultList[0] = reporteDTO;
    }
    return resultList;
  }

  async findByPersonUserId(userId: string): Promise<ReporteDTO[]> {
    const results = await this.reporteRepository.find({
      relations,
      where: { person: { userId } },
      order: { createdAt: 'DESC' } as any,
    });
    return results.map(r => ReporteMapper.fromEntityToDTO(r));
  }

  async save(reporteDTO: ReporteDTO, creator?: string): Promise<ReporteDTO | undefined> {
    const entity = ReporteMapper.fromDTOtoEntity(reporteDTO);
    if (!entity.createdAt) {
      entity.createdAt = new Date();
    }
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.reporteRepository.save(entity);
    return ReporteMapper.fromEntityToDTO(result);
  }

  async update(reporteDTO: ReporteDTO, updater?: string): Promise<ReporteDTO | undefined> {
    const entity = ReporteMapper.fromDTOtoEntity(reporteDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.reporteRepository.save(entity);
    return ReporteMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.reporteRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
