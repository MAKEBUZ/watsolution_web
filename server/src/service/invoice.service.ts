import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Invoice } from '../domain/invoice.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { ActivityAction } from '../domain/enumeration/activity-action';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { InvoiceDTO } from '../service/dto/invoice.dto';
import { InvoiceMapper } from '../service/mapper/invoice.mapper';

const relations = {
  meter: true,
  person: true,
} as const;

@Injectable()
export class InvoiceService {
  logger = new Logger('InvoiceService');

  constructor(
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
    @InjectRepository(ActivityLog) private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async findById(id: number): Promise<InvoiceDTO | undefined> {
    const result = await this.invoiceRepository.findOne({
      relations,
      where: { id },
    });
    return InvoiceMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<InvoiceDTO>): Promise<InvoiceDTO | undefined> {
    const result = await this.invoiceRepository.findOne(options);
    return InvoiceMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<InvoiceDTO>): Promise<[InvoiceDTO[], number]> {
    const resultList = await this.invoiceRepository.findAndCount({ ...options, relations });
    const invoiceDTO: InvoiceDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(invoice => invoiceDTO.push(InvoiceMapper.fromEntityToDTO(invoice)));
      resultList[0] = invoiceDTO;
    }
    return resultList;
  }

  async save(invoiceDTO: InvoiceDTO, creator?: string): Promise<InvoiceDTO | undefined> {
    const entity = InvoiceMapper.fromDTOtoEntity(invoiceDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.invoiceRepository.save(entity);
    return InvoiceMapper.fromEntityToDTO(result);
  }

  async update(invoiceDTO: InvoiceDTO, updater?: string): Promise<InvoiceDTO | undefined> {
    const prevEntity = invoiceDTO.id ? await this.invoiceRepository.findOne({ where: { id: invoiceDTO.id }, relations: { person: true } }) : null;
    const entity = InvoiceMapper.fromDTOtoEntity(invoiceDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.invoiceRepository.save(entity);

    if (entity.status === InvoiceStatus.PAID && prevEntity?.status !== InvoiceStatus.PAID) {
      const log = new ActivityLog();
      log.action = ActivityAction.PAGO_FACTURA;
      log.description = 'Pago de Factura';
      log.reference = `FAC-${result.id}`;
      log.amount = result.amountDue;
      log.personName = prevEntity?.person?.fullName ?? null;
      log.createdAt = new Date();
      await this.activityLogRepository.save(log).catch(() => {});
    }

    return InvoiceMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.invoiceRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
