import { RecordAccessGuard } from '../../security/guards/record-access.guard';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post as PostMethod,
  Put,
  Req,
  ServiceUnavailableException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvoiceDTO } from '../../service/dto/invoice.dto';
import { InvoiceService } from '../../service/invoice.service';
import { InvoicePdfService } from '../../service/invoice-pdf.service';
import { BucketService } from '../../service/bucket.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { NotificationService } from '../../service/notification.service';

@Controller('api/invoices')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('invoices')
export class InvoiceController {
  logger = new Logger('InvoiceController');

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoicePdfService: InvoicePdfService,
    private readonly bucketService: BucketService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('/')
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: InvoiceDTO,
  })
  async getAll(@Req() req: Request): Promise<InvoiceDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.invoiceService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/by-person/:personId')
  @UseGuards(RecordAccessGuard)
  @Roles(RoleType.USER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Get all invoices for a person' })
  @ApiResponse({ status: 200, description: 'Invoices for the person', type: InvoiceDTO })
  async getByPerson(@Param('personId') personId: number): Promise<InvoiceDTO[]> {
    const [results] = await this.invoiceService.findAndCount({
      where: { person: { id: +personId } } as any,
      order: { issueDate: 'DESC' } as any,
      take: 50,
    });
    return results;
  }

  @Get('/download/:id')
  @UseGuards(RecordAccessGuard)
  @Roles(RoleType.USER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Get presigned download URL for invoice PDF (generates on-demand if missing)' })
  @ApiResponse({ status: 200, description: 'Presigned URL' })
  async getDownloadUrl(@Param('id') id: number): Promise<{ url: string }> {
    const invoice = await this.invoiceService.findById(id);
    if (!invoice) throw new NotFoundException('Invoice not found');

    let pdfKey = invoice.pdfUrl;

    if (!pdfKey) {
      try {
        const pdfBuffer = await this.invoicePdfService.generate({
          invoiceId: invoice.id,
          personName: (invoice as any).person?.fullName ?? `Suscriptor ${invoice.id}`,
          documentNumber: (invoice as any).person?.documentNumber,
          subscriberNumber: (invoice as any).person?.subscriberNumber,
          issueDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          consumptionM3: Number(invoice.consumptionM3 ?? 0),
          ratePerM3: Number(invoice.ratePerM3 ?? 0),
          fixedCharge: Number(invoice.fixedCharge ?? 0),
          subsidyPercent: Number(invoice.subsidyPercent ?? 0),
          additionalCharges: Number(invoice.additionalCharges ?? 0),
          amountDue: Number(invoice.amountDue ?? 0),
        });
        pdfKey = `facturacion/FAC-${invoice.id}.pdf`;
        await this.bucketService.uploadPdf(pdfKey, pdfBuffer);
      } catch (err) {
        this.logger.error(`On-demand PDF generation failed for invoice ${id}: ${err?.message ?? err}`);
        throw new ServiceUnavailableException('PDF generation failed for this invoice');
      }
      const updated = await this.invoiceService.updatePdfKey(invoice.id, pdfKey);
      if (!updated) {
        throw new NotFoundException('Invoice not found');
      }
    }

    const url = await this.bucketService.getPresignedUrl(pdfKey);
    return { url };
  }

  @Get('/:id')
  @UseGuards(RecordAccessGuard)
  @Roles(RoleType.USER, RoleType.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: InvoiceDTO,
  })
  async getOne(@Param('id') id: number): Promise<InvoiceDTO> {
    return await this.invoiceService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create invoice' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: InvoiceDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() invoiceDTO: InvoiceDTO): Promise<InvoiceDTO> {
    const created = await this.invoiceService.save(invoiceDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Invoice', created.id);

    try {
      const full = await this.invoiceService.findById(created.id);
      const login = full?.person?.userId ?? full?.person?.email;
      if (login) {
        const year = new Date(created.issueDate).getFullYear();
        const num = `FAC-${year}-${String(created.id).padStart(3, '0')}`;
        await this.notificationService.send(login, 'invoice.created', 'Nueva factura generada', `Se generó la factura ${num} por $${Number(created.amountDue).toLocaleString('es-CO')} COP. Fecha límite: ${new Date(created.dueDate).toLocaleDateString('es-CO')}.`, created.id);
      }
    } catch {}

    return created;
  }

  @PostMethod('/:id/generate-pdf')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Generate PDF for existing invoice and upload to S3' })
  @ApiResponse({ status: 200, description: 'Invoice PDF generated', type: InvoiceDTO })
  async generatePdf(@Req() req: Request, @Param('id') id: number): Promise<InvoiceDTO> {
    const invoice = await this.invoiceService.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    if (!invoice.meter || !invoice.person) {
      throw new NotFoundException('Invoice missing meter or person data');
    }

    const person = invoice.person;
    const meter = invoice.meter;

    // Generate PDF
    const pdfBuffer = await this.invoicePdfService.generate({
      invoiceId: invoice.id!,
      personName: person.fullName ?? `Suscriptor ${person.id}`,
      documentNumber: person.documentNumber,
      subscriberNumber: person.subscriberNumber,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
      consumptionM3: Number(invoice.consumptionM3 ?? 0),
      ratePerM3: Number(invoice.ratePerM3 ?? 0),
      fixedCharge: Number(invoice.fixedCharge ?? 0),
      subsidyPercent: Number(invoice.subsidyPercent ?? 0),
      additionalCharges: Number(invoice.additionalCharges ?? 0),
      amountDue: Number(invoice.amountDue ?? 0),
    });

    const key = `facturacion/FAC-${invoice.id}.pdf`;
    await this.bucketService.uploadPdf(key, pdfBuffer);

    // Persist pdfUrl
    const updated = await this.invoiceService.updatePdfKey(invoice.id, key, req.user?.login);
    if (!updated) {
      throw new NotFoundException('Failed to update invoice with pdfUrl');
    }
    return updated;
  }

  @Put('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: InvoiceDTO,
  })
  async put(@Req() req: Request, @Body() invoiceDTO: InvoiceDTO): Promise<InvoiceDTO> {
    const updated = await this.invoiceService.update(invoiceDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Invoice', invoiceDTO.id);
    return updated;
  }

  @Put('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update invoice with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: InvoiceDTO,
  })
  async putId(@Req() req: Request, @Body() invoiceDTO: InvoiceDTO): Promise<InvoiceDTO> {
    const updated = await this.invoiceService.update(invoiceDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Invoice', invoiceDTO.id);
    return updated;
  }

  @Delete('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    await this.invoiceService.deleteById(id);
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Invoice', id);
  }
}
