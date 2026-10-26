/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { NoticiaCategory } from '../../domain/enumeration/noticia-category';
import { NoticiaStatus } from '../../domain/enumeration/noticia-status';
import { BaseDTO } from './base.dto';

/**
 * A NoticiaDTO object.
 */
export class NoticiaDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ description: 'title field' })
  title: string;

  @ApiProperty({ description: 'summary field', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  summary?: string;

  @ApiProperty({ description: 'content field', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100000)
  content?: string;

  @IsNotEmpty()
  @ApiProperty({ enum: NoticiaCategory, description: 'category enum field' })
  @IsEnum(NoticiaCategory)
  category: NoticiaCategory;

  @ApiProperty({ enum: NoticiaStatus, description: 'status enum field', required: false })
  @IsOptional()
  @IsEnum(NoticiaStatus)
  status?: NoticiaStatus;

  @ApiProperty({ description: 'publishDate field', required: false })
  @IsOptional()
  @IsDateString()
  publishDate?: any;

  @ApiProperty({ description: 'imageUrl field', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
