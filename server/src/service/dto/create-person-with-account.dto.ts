import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePersonWithAccountDTO {
  // ── Person ──────────────────────────────────────────────────────────────────
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Document number (unique)' })
  documentNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Phone – also used as the initial password' })
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'Email – also used as login username' })
  email: string;

  @ApiProperty({ description: 'Subscriber number', required: false })
  subscriberNumber?: string;

  @ApiProperty({ description: 'Stratum (1-6)', required: false })
  stratum?: number;

  // ── Address ─────────────────────────────────────────────────────────────────
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Neighborhood / barrio' })
  neighborhood: string;

  @ApiProperty({ description: 'Street', required: false })
  street?: string;

  @ApiProperty({ description: 'House / apartment number', required: false })
  houseNumber?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'City' })
  city: string;
}
