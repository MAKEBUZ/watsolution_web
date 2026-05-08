import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BillingFormDTO {
  @IsNotEmpty()
  @ApiProperty({ description: 'ID of the person (subscriber) to bill' })
  personId: number;

  @ApiProperty({ description: 'ID of the meter (optional)', required: false })
  meterId?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Previous meter reading (m3)' })
  prevReading: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Current meter reading (m3)' })
  currentReading: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Rate per m3' })
  rate: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Fixed charge' })
  fixedCharge: number;

  @ApiProperty({ description: 'Subsidy percentage (0-1)', required: false })
  subsidy?: number;

  @ApiProperty({ description: 'Additional surcharges', required: false })
  surcharges?: number;
}
