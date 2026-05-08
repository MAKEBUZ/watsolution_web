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

@Module({
  imports: [TypeOrmModule.forFeature([User, Invoice, Meter, Person, ActivityLog])],
  controllers: [AdminController],
  providers: [AdminStatsService, InvoiceService],
})
export class AdminModule {}
