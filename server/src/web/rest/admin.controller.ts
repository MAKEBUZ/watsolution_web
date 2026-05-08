import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Post as PostMethod,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminStatsDTO, UserWithStatusDTO } from '../../service/dto/admin-stats.dto';
import { ActivityLogDTO } from '../../service/dto/activity-log.dto';
import { BillingFormDTO } from '../../service/dto/billing-form.dto';
import { InvoiceDTO } from '../../service/dto/invoice.dto';
import { AdminStatsService } from '../../service/admin-stats.service';
import { InvoiceService } from '../../service/invoice.service';
import { ActivityLog } from '../../domain/activity-log.entity';
import { ActivityAction } from '../../domain/enumeration/activity-action';
import { InvoiceStatus } from '../../domain/enumeration/invoice-status';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('api/admin')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('admin')
export class AdminController {
  logger = new Logger('AdminController');

  constructor(
    private readonly adminStatsService: AdminStatsService,
    private readonly invoiceService: InvoiceService,
    @InjectRepository(ActivityLog) private activityLogRepository: Repository<ActivityLog>,
  ) {}

  @Get('/stats')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get executive stats' })
  @ApiResponse({ status: 200, description: 'Dashboard stats', type: AdminStatsDTO })
  async getStats(): Promise<AdminStatsDTO> {
    return await this.adminStatsService.getStats();
  }

  @Get('/activity')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get recent activity log' })
  @ApiResponse({ status: 200, description: 'Activity log', type: ActivityLogDTO })
  async getActivity(@Query('limit') limit?: number): Promise<ActivityLogDTO[]> {
    return await this.adminStatsService.getActivityLog(limit ? +limit : 10);
  }

  @Get('/users-with-status')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get users with computed status (ACTIVO/MOROSO/SUSPENDIDO)' })
  @ApiResponse({ status: 200, description: 'Users with status', type: UserWithStatusDTO })
  async getUsersWithStatus(): Promise<UserWithStatusDTO[]> {
    return await this.adminStatsService.getUsersWithStatus();
  }

  @PostMethod('/billing/generate')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Generate invoice from billing form' })
  @ApiResponse({ status: 201, description: 'Invoice created', type: InvoiceDTO })
  async generateInvoice(@Req() req: Request, @Body() dto: BillingFormDTO): Promise<InvoiceDTO> {
    const subsidy = dto.subsidy ?? 0;
    const surcharges = dto.surcharges ?? 0;
    const consumption = dto.currentReading - dto.prevReading;
    const consumptionValue = consumption * dto.rate;
    const subtotal = consumptionValue + dto.fixedCharge;
    const subsidyApplied = subtotal * subsidy;
    const total = subtotal - subsidyApplied + surcharges;

    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const invoiceDTO: InvoiceDTO = {
      issueDate: now,
      dueDate,
      consumptionM3: consumption,
      amountDue: Math.round(total),
      status: InvoiceStatus.PENDING,
      person: { id: dto.personId } as any,
      meter: dto.meterId ? ({ id: dto.meterId } as any) : undefined,
    };

    const saved = await this.invoiceService.save(invoiceDTO, req.user?.login);

    const log = new ActivityLog();
    log.action = ActivityAction.PAGO_FACTURA;
    log.description = 'Nueva Factura generada';
    log.reference = `FAC-${saved.id}`;
    log.amount = saved.amountDue;
    log.createdAt = new Date();
    await this.activityLogRepository.save(log).catch(() => {});

    return saved;
  }
}
