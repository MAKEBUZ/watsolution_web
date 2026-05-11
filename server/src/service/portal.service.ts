import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Person } from '../domain/person.entity';
import { Invoice } from '../domain/invoice.entity';
import { Meter } from '../domain/meter.entity';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { PersonStatus } from '../domain/enumeration/person-status';
import { PersonMapper } from '../service/mapper/person.mapper';
import { InvoiceMapper } from '../service/mapper/invoice.mapper';
import { PortalDataDTO, PortalMonthlyPointDTO } from '../service/dto/portal-data.dto';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Injectable()
export class PortalService {
  logger = new Logger('PortalService');

  constructor(
    @InjectRepository(Person) private personRepository: Repository<Person>,
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Meter) private meterRepository: Repository<Meter>,
  ) {}

  async getPortalData(userLogin: string): Promise<PortalDataDTO> {
    this.logger.log(`getPortalData for login: ${userLogin}`);

    const person = await this.personRepository.findOne({
      relations: { address: true },
      where: [{ userId: userLogin }, { email: userLogin }],
    });

    if (!person) {
      this.logger.warn(`No person found for login: ${userLogin}`);
      throw new HttpException(
        'No se encontró perfil de suscriptor para este usuario. Contacte al administrador.',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`Found person id=${person.id} for login: ${userLogin}`);

    // Most recent invoice (any status) — shown as "Factura Actual"
    const [latestInvoice] = await this.invoiceRepository.find({
      where: { person: { id: person.id } },
      order: { issueDate: 'DESC' } as any,
      take: 1,
      relations: { meter: true, person: true },
    });

    // Last 5 invoices (any status)
    const invoiceHistory = await this.invoiceRepository.find({
      where: { person: { id: person.id } },
      order: { issueDate: 'DESC' } as any,
      take: 5,
      relations: { meter: true, person: true },
    });

    // Latest meter reading value for this person
    const latestMeter = await this.meterRepository.findOne({
      where: { person: { id: person.id } },
      order: { readingDate: 'DESC' } as any,
    });
    const monthlyConsumption = latestMeter ? parseFloat(String(latestMeter.waterMeasure)) : 0;

    // Service status
    let serviceStatus = 'ACTIVO';
    if (person.status === PersonStatus.INACTIVE) {
      serviceStatus = 'SUSPENDIDO';
    } else {
      const now = new Date();
      const overdueInvoice = await this.invoiceRepository.findOne({
        where: {
          person: { id: person.id },
          status: InvoiceStatus.PENDING,
          dueDate: LessThan(now) as any,
        },
        relations: { person: true },
      });
      if (overdueInvoice) serviceStatus = 'MOROSO';
    }

    // 6-month consumption trend — use JOIN to reliably filter by person
    const consumptionTrend: PortalMonthlyPointDTO[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const from = new Date(d.getFullYear(), d.getMonth(), 1);
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const result = await this.meterRepository
        .createQueryBuilder('m')
        .innerJoin('m.person', 'p')
        .select('SUM(m.waterMeasure)', 'total')
        .where('p.id = :personId', { personId: person.id })
        .andWhere('m.readingDate >= :from', { from })
        .andWhere('m.readingDate < :to', { to })
        .getRawOne();

      consumptionTrend.push({ month: MONTH_NAMES[d.getMonth()], value: parseFloat(result?.total ?? '0') });
    }

    this.logger.log(`Portal data loaded: invoices=${invoiceHistory.length}, consumption=${monthlyConsumption}, status=${serviceStatus}`);

    return {
      person: PersonMapper.fromEntityToDTO(person),
      currentInvoice: latestInvoice ? InvoiceMapper.fromEntityToDTO(latestInvoice) : null,
      invoiceHistory: invoiceHistory.map(inv => InvoiceMapper.fromEntityToDTO(inv)),
      monthlyConsumption,
      serviceStatus,
      consumptionTrend,
    };
  }
}
