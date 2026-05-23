import { Body, Controller, Get, Headers, Logger, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { BoldService } from '../../service/bold.service';

@ApiTags('bold')
@Controller('api/bold')
@UseInterceptors(LoggingInterceptor)
export class BoldController {
  private readonly logger = new Logger('BoldController');

  constructor(private readonly boldService: BoldService) {}

  @Get('/hash')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Bold payment hash for an invoice' })
  @ApiResponse({ status: 200, description: 'Returns boldOrderId, hash and apiKey' })
  async getHash(@Query('invoiceId') invoiceId: string): Promise<{ boldOrderId: string; hash: string; apiKey: string; amount: number }> {
    return this.boldService.getHashForInvoice(Number(invoiceId));
  }

  @Post('/webhook')
  @ApiOperation({ summary: 'Bold payment webhook' })
  @ApiResponse({ status: 200, description: 'OK' })
  async webhook(
    @Body() body: any,
    @Headers('x-bold-signature') signature: string,
  ): Promise<string> {
    await this.boldService.processWebhook(body, JSON.stringify(body), signature ?? '');
    return 'OK';
  }

  @Get('/result/:invoiceId')
  @UseGuards(AuthGuard, RolesGuard)
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
