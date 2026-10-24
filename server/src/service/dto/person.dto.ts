/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEmail, IsEnum, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PersonStatus } from '../../domain/enumeration/person-status';
import { BaseDTO } from './base.dto';

import { AddressDTO } from './address.dto';

/**
 * A PersonDTO object.
 */
export class PersonDTO extends BaseDTO {
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ description: 'fullName field' })
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  @ApiProperty({ description: 'documentNumber field' })
  documentNumber: string;

  @ApiProperty({ description: 'phone field', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ description: 'email field', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiProperty({ enum: PersonStatus, description: 'status enum field', required: false })
  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;

  @ApiProperty({ description: 'createdAt field', required: false })
  createdAt?: any;

  @ApiProperty({ description: 'subscriberNumber field', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  subscriberNumber?: string;

  @ApiProperty({ description: 'stratum field', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
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
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDTO)
  address?: AddressDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
