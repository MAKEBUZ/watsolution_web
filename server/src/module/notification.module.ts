import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../domain/notification.entity';
import { Invoice } from '../domain/invoice.entity';
import { User } from '../domain/user.entity';
import { NotificationService } from '../service/notification.service';
import { NotificationController } from '../web/rest/notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Invoice, User])],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
