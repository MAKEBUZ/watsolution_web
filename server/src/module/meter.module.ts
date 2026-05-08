import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meter } from '../domain/meter.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { MeterController } from '../web/rest/meter.controller';
import { MeterService } from '../service/meter.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meter, ActivityLog])],
  controllers: [MeterController],
  providers: [MeterService],
  exports: [MeterService],
})
export class MeterModule {}
