/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { NoticiaCategory } from '../../domain/enumeration/noticia-category';
import { NoticiaStatus } from '../../domain/enumeration/noticia-status';
import { BaseDTO } from './base.dto';

/**
 * A NoticiaDTO object.
 */
export class NoticiaDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'title field' })
  title: string;

  @ApiProperty({ description: 'summary field', required: false })
  summary?: string;

  @ApiProperty({ description: 'content field', required: false })
  content?: string;

  @IsNotEmpty()
  @ApiProperty({ enum: NoticiaCategory, description: 'category enum field' })
  category: NoticiaCategory;

  @ApiProperty({ enum: NoticiaStatus, description: 'status enum field', required: false })
  status?: NoticiaStatus;

  @ApiProperty({ description: 'publishDate field', required: false })
  publishDate?: any;

  @ApiProperty({ description: 'imageUrl field', required: false })
  imageUrl?: string;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
