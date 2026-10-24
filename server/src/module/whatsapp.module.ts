import { Module } from '@nestjs/common';
import { WhatsappService } from '../service/whatsapp.service';
import { WhatsappController } from '../web/rest/whatsapp.controller';
import { WhatsappAccountController } from '../web/rest/whatsapp-account.controller';
import { WhatsappAccountService } from '../service/whatsapp-account.service';
import { WhatsappAssistantService } from '../service/whatsapp-assistant.service';
import { WhatsappWorkerService } from '../service/whatsapp-worker.service';
import { WhatsappTemplateService } from '../service/whatsapp-template.service';
import { WhatsappAdminService } from '../service/whatsapp-admin.service';
import { WhatsappAdminController } from '../web/rest/whatsapp-admin.controller';

@Module({
  controllers: [WhatsappController, WhatsappAccountController, WhatsappAdminController],
  providers: [
    WhatsappService,
    WhatsappAccountService,
    WhatsappAssistantService,
    WhatsappWorkerService,
    WhatsappTemplateService,
    WhatsappAdminService,
  ],
})
export class WhatsappModule {}
