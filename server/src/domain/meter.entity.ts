/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Person } from './person.entity';
import { Address } from './address.entity';

/**
 * A Meter.
 */
@Entity('meter')
export class Meter extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'decimal', name: 'water_measure', precision: 10, scale: 2 })
  waterMeasure: number;

  @Column({ type: 'date', name: 'reading_date' })
  readingDate: any;

  @Column({ name: 'observation', nullable: true })
  observation?: string;

  @Column({ type: 'timestamp', name: 'created_at', nullable: true })
  createdAt?: any;

  @ManyToOne(type => Person)
  person?: Person;

  @ManyToOne(type => Address)
  address?: Address;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
