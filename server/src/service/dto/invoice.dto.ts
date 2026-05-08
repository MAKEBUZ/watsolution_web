/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { InvoiceStatus } from '../../domain/enumeration/invoice-status';
import { BaseDTO } from './base.dto';

import { MeterDTO } from './meter.dto';
import { PersonDTO } from './person.dto';

/**
 * A InvoiceDTO object.
 */
export class InvoiceDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'issueDate field' })
  issueDate: any;

  @IsNotEmpty()
  @ApiProperty({ description: 'dueDate field' })
  dueDate: any;

  @IsNotEmpty()
  @ApiProperty({ description: 'consumptionM3 field' })
  consumptionM3: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'amountDue field' })
  amountDue: number;

  @ApiProperty({ enum: InvoiceStatus, description: 'status enum field', required: false })
  status?: InvoiceStatus;

  @ApiProperty({ description: 'createdAt field', required: false })
  createdAt?: any;

  @ApiProperty({ type: () => MeterDTO, description: 'meter relationship' })
  meter?: MeterDTO;
  @ApiProperty({ type: () => PersonDTO, description: 'person relationship' })
  person?: PersonDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
