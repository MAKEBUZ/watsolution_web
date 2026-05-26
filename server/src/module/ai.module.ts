import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../domain/invoice.entity';
import { Person } from '../domain/person.entity';
import { AiService } from '../service/ai.service';
import { AiController } from '../web/rest/ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Person])],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
