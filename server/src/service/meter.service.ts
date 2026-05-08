import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Meter } from '../domain/meter.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { ActivityAction } from '../domain/enumeration/activity-action';
import { MeterDTO } from '../service/dto/meter.dto';
import { MeterMapper } from '../service/mapper/meter.mapper';

const relations = {
  person: true,
  address: true,
} as const;

@Injectable()
export class MeterService {
  logger = new Logger('MeterService');

  constructor(
    @InjectRepository(Meter) private meterRepository: Repository<Meter>,
    @InjectRepository(ActivityLog) private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async findById(id: number): Promise<MeterDTO | undefined> {
    const result = await this.meterRepository.findOne({
      relations,
      where: { id },
    });
    return MeterMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<MeterDTO>): Promise<MeterDTO | undefined> {
    const result = await this.meterRepository.findOne(options);
    return MeterMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<MeterDTO>): Promise<[MeterDTO[], number]> {
    const resultList = await this.meterRepository.findAndCount({ ...options, relations });
    const meterDTO: MeterDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(meter => meterDTO.push(MeterMapper.fromEntityToDTO(meter)));
      resultList[0] = meterDTO;
    }
    return resultList;
  }

  async save(meterDTO: MeterDTO, creator?: string): Promise<MeterDTO | undefined> {
    const entity = MeterMapper.fromDTOtoEntity(meterDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.meterRepository.save(entity);

    const log = new ActivityLog();
    log.action = ActivityAction.LECTURA_CONTADOR;
    log.description = 'Nueva Lectura';
    log.reference = `${result.waterMeasure} m³`;
    log.createdAt = new Date();
    await this.activityLogRepository.save(log).catch(() => {});

    return MeterMapper.fromEntityToDTO(result);
  }

  async update(meterDTO: MeterDTO, updater?: string): Promise<MeterDTO | undefined> {
    const entity = MeterMapper.fromDTOtoEntity(meterDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.meterRepository.save(entity);
    return MeterMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.meterRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
