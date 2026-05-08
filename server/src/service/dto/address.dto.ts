/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

/**
 * A AddressDTO object.
 */
export class AddressDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'neighborhood field' })
  neighborhood: string;

  @ApiProperty({ description: 'street field', required: false })
  street?: string;

  @ApiProperty({ description: 'houseNumber field', required: false })
  houseNumber?: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'city field' })
  city: string;

  @ApiProperty({ description: 'latitude field', required: false })
  latitude?: number;

  @ApiProperty({ description: 'longitude field', required: false })
  longitude?: number;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
