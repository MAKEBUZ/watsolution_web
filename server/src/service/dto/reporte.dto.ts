/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ReporteType } from '../../domain/enumeration/reporte-type';
import { ReporteStatus } from '../../domain/enumeration/reporte-status';
import { BaseDTO } from './base.dto';
import { PersonDTO } from './person.dto';

/**
 * A ReporteDTO object.
 */
export class ReporteDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ enum: ReporteType, description: 'type enum field' })
  @IsEnum(ReporteType)
  type: ReporteType;

  @ApiProperty({ description: 'description field', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiProperty({ enum: ReporteStatus, description: 'status enum field', required: false })
  @IsOptional()
  @IsEnum(ReporteStatus)
  status?: ReporteStatus;

  @ApiProperty({ description: 'createdAt field', required: false })
  @IsOptional()
  @IsDateString()
  createdAt?: any;

  @ApiProperty({ type: () => PersonDTO, description: 'person relationship' })
  person?: PersonDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
