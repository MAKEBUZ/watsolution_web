import { BillingService } from '../../service/billing.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post as PostMethod,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const QRCode = require('qrcode');
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminStatsDTO, DashboardChartDataDTO, UserWithStatusDTO } from '../../service/dto/admin-stats.dto';
import { ActivityLogDTO } from '../../service/dto/activity-log.dto';
import { BillingFormDTO } from '../../service/dto/billing-form.dto';
import { InvoiceDTO } from '../../service/dto/invoice.dto';
import { AdminStatsService } from '../../service/admin-stats.service';
import { InvoiceService } from '../../service/invoice.service';
import { MeterService } from '../../service/meter.service';
import { BucketService } from '../../service/bucket.service';
import { InvoicePdfService } from '../../service/invoice-pdf.service';
import { ActivityLog } from '../../domain/activity-log.entity';
import { Person } from '../../domain/person.entity';
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
    private readonly billing: BillingService,
    private readonly adminStatsService: AdminStatsService,
    private readonly invoiceService: InvoiceService,
    private readonly meterService: MeterService,
    private readonly bucketService: BucketService,
    private readonly invoicePdfService: InvoicePdfService,
    @InjectRepository(ActivityLog) private activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(Person) private personRepository: Repository<Person>,
  ) {}

  @Get('/stats')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get executive stats' })
  @ApiResponse({ status: 200, description: 'Dashboard stats', type: AdminStatsDTO })
  async getStats(): Promise<AdminStatsDTO> {
    return await this.adminStatsService.getStats();
  }

  @Get('/dashboard')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get chart data for the dashboard (6-month trends)' })
  @ApiResponse({ status: 200, description: 'Chart data', type: DashboardChartDataDTO })
  async getDashboardChartData(): Promise<DashboardChartDataDTO> {
    return await this.adminStatsService.getChartData();
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

  @Get('/people/:personId/qr')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Generate QR code for a subscriber and store in S3' })
  @ApiResponse({ status: 200, description: 'Presigned URL for QR PNG' })
  async getSubscriberQr(@Param('personId') personId: number): Promise<{ url: string; filename: string }> {
    const person = await this.personRepository.findOne({
      where: { id: +personId },
      relations: { address: true },
    });
    if (!person) throw new NotFoundException(`Person ${personId} not found`);

    const address = person.address
      ? [person.address.street, person.address.houseNumber, person.address.neighborhood, person.address.city]
          .filter(Boolean).join(', ')
      : '';

    const payload = JSON.stringify({ v: 2, personId: person.id });

    const pngBuffer: Buffer = await QRCode.toBuffer(payload, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });

    const slug = String(person.id);
    const key = `qr-suscriptores/QR-${slug}.png`;

    await this.bucketService.uploadFile(key, pngBuffer, 'image/png');

    const url = await this.bucketService.getPresignedUrl(key, 300);
    const filename = `QR-WatSolution-${slug}.png`;
    return { url, filename };
  }

  @PostMethod('/billing/generate')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Generate invoice from billing form' })
  @ApiResponse({ status: 201, description: 'Invoice created', type: InvoiceDTO })
  async generateInvoice(@Req() req: Request, @Body() dto: BillingFormDTO): Promise<InvoiceDTO> {
    return this.billing.generate(req.user.login, dto);
  }
}
