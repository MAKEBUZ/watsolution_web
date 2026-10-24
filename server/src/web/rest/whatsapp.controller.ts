import { Body, Controller, Get, Header, Headers, HttpCode, Post, Query, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { WhatsappService } from '../../service/whatsapp.service';

// Meta authenticates with the verification token (GET) and HMAC (POST), not a portal session.
// Do not attach LoggingInterceptor: the verification query and message bodies are private.
@Controller('api/whatsapp/webhook')
export class WhatsappController {
  constructor(private readonly whatsapp: WhatsappService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'no-store')
  verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    return this.whatsapp.verify(mode, token, challenge);
  }

  @Post()
  @HttpCode(200)
  async receive(@Body() body: unknown, @Req() req: RawBodyRequest<Request>, @Headers('x-hub-signature-256') signature: string) {
    await this.whatsapp.receive(body, req.rawBody, signature);
    return 'EVENT_RECEIVED';
  }
}
