import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../domain/invoice.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { User } from '../domain/user.entity';
import { InvoiceController } from '../web/rest/invoice.controller';
import { InvoiceService } from '../service/invoice.service';
import { BucketService } from '../service/bucket.service';
import { NotificationModule } from './notification.module';

import { InvoicePdfService } from '../service/invoice-pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, ActivityLog, User]), NotificationModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoicePdfService, BucketService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
