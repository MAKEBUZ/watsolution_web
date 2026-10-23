import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Invoice } from '../domain/invoice.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { User } from '../domain/user.entity';
import { InvoiceDTO } from '../service/dto/invoice.dto';
import { InvoiceMapper } from '../service/mapper/invoice.mapper';
import { NotificationService } from './notification.service';

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
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
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

  async save(_dto: InvoiceDTO, _creator?: string): Promise<InvoiceDTO | undefined> {
    throw new ConflictException('La modificación directa de facturas está suspendida. Emita facturas desde Facturación; los pagos se registran por el flujo verificado.');
  }

  async update(_dto: InvoiceDTO, _updater?: string): Promise<InvoiceDTO | undefined> {
    throw new ConflictException('La modificación directa de facturas está suspendida. Emita facturas desde Facturación; los pagos se registran por el flujo verificado.');
  }

  async updatePdfKey(id: number, pdfUrl: string, updater?: string): Promise<InvoiceDTO | undefined> {
    // A PDF may finish after a payment. Never save the earlier invoice snapshot.
    const changes: Partial<Invoice> = { pdfUrl };
    if (updater) changes.lastModifiedBy = updater;
    const result = await this.invoiceRepository.update(id, changes);
    if (result.affected === 0) return undefined;
    return this.findById(id);
  }

  async deleteById(_id: number): Promise<void | undefined> {
    throw new ConflictException('La modificación directa de facturas está suspendida. Emita facturas desde Facturación; los pagos se registran por el flujo verificado.');
  }
}
