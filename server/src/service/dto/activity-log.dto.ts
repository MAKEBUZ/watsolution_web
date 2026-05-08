/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ActivityAction } from '../../domain/enumeration/activity-action';
import { BaseDTO } from './base.dto';

/**
 * An ActivityLogDTO object.
 */
export class ActivityLogDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ enum: ActivityAction, description: 'action enum field' })
  action: ActivityAction;

  @IsNotEmpty()
  @ApiProperty({ description: 'description field' })
  description: string;

  @ApiProperty({ description: 'reference field', required: false })
  reference?: string;

  @ApiProperty({ description: 'amount field', required: false })
  amount?: number;

  @ApiProperty({ description: 'personName field', required: false })
  personName?: string;

  @ApiProperty({ description: 'createdAt field' })
  createdAt: any;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
