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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvoiceDTO } from '../../service/dto/invoice.dto';
import { InvoiceService } from '../../service/invoice.service';
import { BucketService } from '../../service/bucket.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/invoices')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('invoices')
export class InvoiceController {
  logger = new Logger('InvoiceController');

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly bucketService: BucketService,
  ) {}

  @Get('/')
  @Roles(RoleType.USER)
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
  @Roles(RoleType.USER)
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
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Get presigned download URL for invoice PDF' })
  @ApiResponse({ status: 200, description: 'Presigned URL' })
  async getDownloadUrl(@Param('id') id: number): Promise<{ url: string }> {
    const invoice = await this.invoiceService.findById(id);
    if (!invoice?.pdfUrl) throw new NotFoundException('PDF not available for this invoice');
    const url = await this.bucketService.getPresignedUrl(invoice.pdfUrl);
    return { url };
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: InvoiceDTO,
  })
  async getOne(@Param('id') id: number): Promise<InvoiceDTO> {
    return await this.invoiceService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
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
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: InvoiceDTO,
  })
  async put(@Req() req: Request, @Body() invoiceDTO: InvoiceDTO): Promise<InvoiceDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Invoice', invoiceDTO.id);
    return await this.invoiceService.update(invoiceDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update invoice with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: InvoiceDTO,
  })
  async putId(@Req() req: Request, @Body() invoiceDTO: InvoiceDTO): Promise<InvoiceDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Invoice', invoiceDTO.id);
    return await this.invoiceService.update(invoiceDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Invoice', id);
    return await this.invoiceService.deleteById(id);
  }
}
