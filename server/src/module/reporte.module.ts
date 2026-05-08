import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reporte } from '../domain/reporte.entity';
import { ActivityLog } from '../domain/activity-log.entity';
import { ReporteController } from '../web/rest/reporte.controller';
import { ReporteService } from '../service/reporte.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reporte, ActivityLog])],
  controllers: [ReporteController],
  providers: [ReporteService],
  exports: [ReporteService],
})
export class ReporteModule {}
