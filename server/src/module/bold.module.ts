import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../domain/invoice.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { BoldController } from '../web/rest/bold.controller';
import { BoldService } from '../service/bold.service';
import { NotificationModule } from './notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, ActivityLog]), NotificationModule],
  controllers: [BoldController],
  providers: [BoldService],
})
export class BoldModule {}
