import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../domain/invoice.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { InvoiceController } from '../web/rest/invoice.controller';
import { InvoiceService } from '../service/invoice.service';
import { BucketService } from '../service/bucket.service';
import { NotificationModule } from './notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, ActivityLog]), NotificationModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, BucketService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
