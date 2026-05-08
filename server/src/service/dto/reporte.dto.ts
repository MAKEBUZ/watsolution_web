/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
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
  type: ReporteType;

  @ApiProperty({ description: 'description field', required: false })
  description?: string;

  @ApiProperty({ enum: ReporteStatus, description: 'status enum field', required: false })
  status?: ReporteStatus;

  @ApiProperty({ description: 'createdAt field', required: false })
  createdAt?: any;

  @ApiProperty({ type: () => PersonDTO, description: 'person relationship' })
  person?: PersonDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
