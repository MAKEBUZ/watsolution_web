import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { Exclude } from 'class-transformer';
import { BaseDTO } from './base.dto';

/**
 * An User DTO object.
 */
export class UserDTO extends BaseDTO {
  id?: number;

  @ApiProperty({ uniqueItems: true, example: 'myuser', description: 'User login' })
  @IsString()
  @MinLength(1)
  @MaxLength(254)
  login: string;

  @ApiProperty({ example: 'MyUser', description: 'User first name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firstName?: string;

  @ApiProperty({ example: 'MyUser', description: 'User last name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string;

  @ApiProperty({ example: 'myuser@localhost.it', description: 'User email' })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'true', description: 'User activation', required: false })
  @IsOptional()
  @IsBoolean()
  activated?: boolean;

  @ApiProperty({ example: 'en', description: 'User language', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  langKey?: string;

  @ApiProperty({
    isArray: true,
    enum: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_ANONYMOUS'],
    description: 'Array of permissions',
    required: false,
  })
  authorities?: any[];

  @Exclude()
  @ApiProperty({ example: 'myuser', description: 'User password' })
  password: string;

  @ApiProperty({ example: 'http://my-image-url', description: 'Image url', required: false })
  imageUrl?: string;

  @Exclude()
  activationKey?: string;

  @Exclude()
  resetKey?: string;

  @Exclude()
  resetDate?: Date;
}
