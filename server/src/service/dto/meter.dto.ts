/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

import { PersonDTO } from './person.dto';
import { AddressDTO } from './address.dto';

/**
 * A MeterDTO object.
 */
export class MeterDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'waterMeasure field' })
  waterMeasure: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'readingDate field' })
  readingDate: any;

  @ApiProperty({ description: 'observation field', required: false })
  observation?: string;

  @ApiProperty({ description: 'createdAt field', required: false })
  createdAt?: any;

  @ApiProperty({ type: () => PersonDTO, description: 'person relationship' })
  person?: PersonDTO;
  @ApiProperty({ type: () => AddressDTO, description: 'address relationship' })
  address?: AddressDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
