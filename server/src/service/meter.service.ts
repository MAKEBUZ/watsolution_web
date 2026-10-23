import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Meter } from '../domain/meter.entity';
import { ActivityLog } from '../domain/activity-log.entity';
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

  async save(_dto: MeterDTO, _creator?: string): Promise<MeterDTO | undefined> {
    throw new ConflictException('La modificación directa de lecturas está suspendida. Registre nuevas lecturas desde el flujo de captura de funcionarios.');
  }

  async update(_dto: MeterDTO, _updater?: string): Promise<MeterDTO | undefined> {
    throw new ConflictException('La modificación directa de lecturas está suspendida. Registre nuevas lecturas desde el flujo de captura de funcionarios.');
  }

  async deleteById(_id: number): Promise<void | undefined> {
    throw new ConflictException('La modificación directa de lecturas está suspendida. Registre nuevas lecturas desde el flujo de captura de funcionarios.');
  }
}
