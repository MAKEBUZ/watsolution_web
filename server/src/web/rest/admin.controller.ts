import { BillingService } from '../../service/billing.service';
import {
  Body,
  BadRequestException,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Header,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post as PostMethod,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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

  @Get('/activity-page')
  @Roles(RoleType.ADMIN)
  async activityPage(@Query('page') page = '0', @Query('size') size = '10') {
    const p = Number(page),
      s = Number(size);
    if (!Number.isSafeInteger(p) || p < 0 || !Number.isSafeInteger(s) || s < 1 || s > 100)
      throw new BadRequestException('Invalid pagination');
    return this.adminStatsService.getActivityPage(p, s);
  }

  @Get('/people/:personId/qr')
  @Roles(RoleType.ADMIN)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Generate QR code for a subscriber and store in S3' })
  @ApiResponse({ status: 200, description: 'Presigned URL for QR PNG' })
  async getSubscriberQr(@Param('personId', ParseIntPipe) personId: number): Promise<{ url: string; filename: string }> {
    if (!Number.isSafeInteger(personId) || personId <= 0 || personId > 2147483647) {
      throw new BadRequestException('Invalid subscriber identifier');
    }
    const person = await this.personRepository.findOne({
      where: { id: personId },
      select: { id: true },
    });
    if (!person) throw new NotFoundException(`Person ${personId} not found`);

    // This is a lookup identifier, never a credential or an authorization grant.
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
