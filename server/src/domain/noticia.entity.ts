/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { NoticiaCategory } from './enumeration/noticia-category';
import { NoticiaStatus } from './enumeration/noticia-status';

/**
 * A Noticia.
 */
@Entity('noticia')
export class Noticia extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary?: string;

  @Column({ name: 'content', type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'varchar', name: 'category', enum: NoticiaCategory })
  category: NoticiaCategory;

  @Column({ type: 'varchar', name: 'status', enum: NoticiaStatus, default: NoticiaStatus.ACTIVE })
  status?: NoticiaStatus;

  @Column({ type: 'date', name: 'publish_date', nullable: true })
  publishDate?: any;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
