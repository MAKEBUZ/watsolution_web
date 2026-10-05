import { BillingService } from '../service/billing.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { Invoice } from '../domain/invoice.entity';
import { Meter } from '../domain/meter.entity';
import { Person } from '../domain/person.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { AdminController } from '../web/rest/admin.controller';
import { AdminStatsService } from '../service/admin-stats.service';
import { InvoiceService } from '../service/invoice.service';
import { MeterService } from '../service/meter.service';
import { BucketService } from '../service/bucket.service';
import { InvoicePdfService } from '../service/invoice-pdf.service';
import { TankLevelGateway } from '../web/rest/tank-level.gateway';
import { NotificationModule } from './notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Invoice, Meter, Person, ActivityLog]), NotificationModule],
  controllers: [AdminController],
  providers: [BillingService, AdminStatsService, InvoiceService, MeterService, BucketService, InvoicePdfService, TankLevelGateway],
})
export class AdminModule {}
