import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '../domain/person.entity';
import { Invoice } from '../domain/invoice.entity';
import { Meter } from '../domain/meter.entity';
import { PortalController } from '../web/rest/portal.controller';
import { PortalService } from '../service/portal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Invoice, Meter])],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
