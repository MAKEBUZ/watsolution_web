import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { Invoice } from '../domain/invoice.entity';
import { Meter } from '../domain/meter.entity';
import { Person } from '../domain/person.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { AdminStatsDTO, DashboardChartDataDTO, MonthlyDataPointDTO, UserWithStatusDTO } from '../service/dto/admin-stats.dto';
import { ActivityLogDTO } from '../service/dto/activity-log.dto';
import { ActivityLogMapper } from '../service/mapper/activity-log.mapper';

@Injectable()
export class AdminStatsService {
  logger = new Logger('AdminStatsService');

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Meter) private meterRepository: Repository<Meter>,
    @InjectRepository(Person) private personRepository: Repository<Person>,
    @InjectRepository(ActivityLog) private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async getStats(): Promise<AdminStatsDTO> {
    const activeUsers = await this.userRepository.count({ where: { activated: true } });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const revenueResult = await this.invoiceRepository
      .createQueryBuilder('i')
      .select('SUM(i.amount_due)', 'total')
      .where('i.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('i.issue_date >= :from', { from: firstDayOfMonth })
      .getRawOne();

    const consumptionResult = await this.meterRepository
      .createQueryBuilder('m')
      .select('SUM(m.water_measure)', 'total')
      .where('m.reading_date >= :from', { from: firstDayOfMonth })
      .getRawOne();

    return {
      activeUsers,
      monthlyRevenue: parseFloat(revenueResult?.total ?? '0'),
      totalConsumption: parseFloat(consumptionResult?.total ?? '0'),
    };
  }

  async getChartData(): Promise<DashboardChartDataDTO> {
    const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const consumptionTrend: MonthlyDataPointDTO[] = [];
    const monthlyRevenue: MonthlyDataPointDTO[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const from = new Date(d.getFullYear(), d.getMonth(), 1);
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const label = MONTH_NAMES[d.getMonth()];

      const consumptionResult = await this.meterRepository
        .createQueryBuilder('m')
        .select('SUM(m.water_measure)', 'total')
        .where('m.reading_date >= :from', { from })
        .andWhere('m.reading_date < :to', { to })
        .getRawOne();

      const revenueResult = await this.invoiceRepository
        .createQueryBuilder('i')
        .select('SUM(i.amount_due)', 'total')
        .where('i.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('i.issue_date >= :from', { from })
        .andWhere('i.issue_date < :to', { to })
        .getRawOne();

      consumptionTrend.push({ month: label, value: parseFloat(consumptionResult?.total ?? '0') });
      monthlyRevenue.push({ month: label, value: parseFloat(revenueResult?.total ?? '0') });
    }

    return { consumptionTrend, monthlyRevenue };
  }

  async getActivityLog(limit = 10): Promise<ActivityLogDTO[]> {
    const results = await this.activityLogRepository.find({
      order: { createdAt: 'DESC' } as any,
      take: limit,
    });
    return results.map(a => ActivityLogMapper.fromEntityToDTO(a));
  }

  async getUsersWithStatus(): Promise<UserWithStatusDTO[]> {
    const users = await this.userRepository.find({
      order: { lastModifiedDate: 'DESC' } as any,
    });

    const now = new Date();

    const result: UserWithStatusDTO[] = [];

    for (const user of users) {
      const person = await this.personRepository.findOne({
        where: [{ userId: user.login }, { email: user.email }],
      });

      let userStatus = 'ACTIVO';

      if (!user.activated) {
        userStatus = 'SUSPENDIDO';
      } else if (person) {
        const overdueInvoice = await this.invoiceRepository.findOne({
          where: {
            person: { id: person.id },
            status: InvoiceStatus.PENDING,
            dueDate: LessThan(now) as any,
          },
          relations: { person: true },
        });
        if (overdueInvoice) {
          userStatus = 'MOROSO';
        }
      }

      const role = user.authorities?.some((a: any) => (a.name ?? a) === 'ROLE_ADMIN') ? 'ADMIN' : 'USER';

      result.push({
        id: user.id,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        activated: user.activated,
        lastModifiedDate: user.lastModifiedDate,
        userStatus,
        role,
        subscriberNumber: person?.subscriberNumber,
      });
    }

    return result;
  }
}
