import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreatePersonWithAccountDTO {
  // ── Person ──────────────────────────────────────────────────────────────────
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Full name' })
  @MaxLength(255)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Document number (unique)' })
  @MaxLength(64)
  documentNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Contact phone' })
  @MaxLength(50)
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'Email – also used as login username' })
  @MaxLength(254)
  email: string;

  @ApiProperty({ description: 'Subscriber number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  subscriberNumber?: string;

  @ApiProperty({ description: 'Stratum (1-6)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  stratum?: number;

  // ── Address ─────────────────────────────────────────────────────────────────
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Neighborhood / barrio' })
  @MaxLength(255)
  neighborhood: string;

  @ApiProperty({ description: 'Street', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @ApiProperty({ description: 'House / apartment number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  houseNumber?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'City' })
  @MaxLength(255)
  city: string;
}
