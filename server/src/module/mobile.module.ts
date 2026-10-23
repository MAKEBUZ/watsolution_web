import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { MobileOperation } from '../domain/mobile-operation.entity';
import { MobileController } from '../web/rest/mobile.controller';
import { MobileService } from '../service/mobile.service';

@Module({ imports: [AuthModule, TypeOrmModule.forFeature([MobileOperation])], controllers: [MobileController], providers: [MobileService] })
export class MobileModule {}
