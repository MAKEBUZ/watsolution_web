/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsInt, Min, Max, IsNumber } from 'class-validator';
import { BaseDTO } from './base.dto';

/**
 * A AddressDTO object.
 */
export class AddressDTO extends BaseDTO {
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ description: 'neighborhood field' })
  neighborhood: string;

  @ApiProperty({ description: 'street field', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @ApiProperty({ description: 'houseNumber field', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  houseNumber?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ description: 'city field' })
  city: string;

  @ApiProperty({ description: 'latitude field', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ description: 'longitude field', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
