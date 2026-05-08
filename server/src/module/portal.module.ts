import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '../domain/person.entity';
import { Invoice } from '../domain/invoice.entity';
import { PortalController } from '../web/rest/portal.controller';
import { PortalService } from '../service/portal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Invoice])],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
