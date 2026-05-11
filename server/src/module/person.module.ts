import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '../domain/person.entity';
import { PersonController } from '../web/rest/person.controller';
import { PersonService } from '../service/person.service';
import { AddressModule } from './address.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Person]), AddressModule, AuthModule],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
