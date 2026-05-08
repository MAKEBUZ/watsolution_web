/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PersonStatus } from '../../domain/enumeration/person-status';
import { BaseDTO } from './base.dto';

import { AddressDTO } from './address.dto';

/**
 * A PersonDTO object.
 */
export class PersonDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'fullName field' })
  fullName: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'documentNumber field' })
  documentNumber: string;

  @ApiProperty({ description: 'phone field', required: false })
  phone?: string;

  @ApiProperty({ description: 'email field', required: false })
  email?: string;

  @ApiProperty({ enum: PersonStatus, description: 'status enum field', required: false })
  status?: PersonStatus;

  @ApiProperty({ description: 'createdAt field', required: false })
  createdAt?: any;

  @ApiProperty({ description: 'subscriberNumber field', required: false })
  subscriberNumber?: string;

  @ApiProperty({ description: 'stratum field', required: false })
  stratum?: number;

  @ApiProperty({ description: 'userId field', required: false })
  userId?: string;

  @ApiProperty({ description: 'greenPoints field', required: false })
  greenPoints?: number;

  @ApiProperty({ description: 'daysSinceLastDebt field', required: false })
  daysSinceLastDebt?: number;

  @ApiProperty({ description: 'savingsPercent field', required: false })
  savingsPercent?: number;

  @ApiProperty({ type: () => AddressDTO, description: 'address relationship' })
  address?: AddressDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
