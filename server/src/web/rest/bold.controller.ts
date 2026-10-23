import { Body, Controller, Get, Headers, HttpCode, Logger, Param, Post, Query, Req, RawBodyRequest, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { BoldService } from '../../service/bold.service';
import { RecordAccessGuard } from '../../security/guards/record-access.guard';

@ApiTags('bold')
@Controller('api/bold')
@UseInterceptors(LoggingInterceptor)
export class BoldController {
  private readonly logger = new Logger('BoldController');

  constructor(private readonly boldService: BoldService) {}

  @Get('/hash')
  @UseGuards(AuthGuard, RolesGuard, RecordAccessGuard)
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Bold payment hash for an invoice' })
  @ApiResponse({ status: 200, description: 'Returns boldOrderId, hash and apiKey' })
  async getHash(@Query('invoiceId') invoiceId: string): Promise<{ boldOrderId: string; hash: string; apiKey: string; amount: number }> {
    return this.boldService.getHashForInvoice(Number(invoiceId));
  }

  @Post('/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Bold payment webhook' })
  @ApiResponse({ status: 200, description: 'OK' })
  async webhook(
    @Body() body: any,
    @Headers('x-bold-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<string> {
    await this.boldService.processWebhook(body, req.rawBody, signature ?? '');
    return 'OK';
  }

  @Get('/result/:invoiceId')
  @UseGuards(AuthGuard, RolesGuard, RecordAccessGuard)
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm Bold payment result for an invoice' })
  @ApiResponse({ status: 200, description: 'Returns boldStatus and updated invoiceStatus' })
  async getResult(
    @Param('invoiceId') invoiceId: string,
    @Query('boldOrderId') boldOrderId: string,
  ): Promise<{ boldStatus: string; invoiceStatus: string }> {
    return this.boldService.processResult(Number(invoiceId), boldOrderId);
  }
}
