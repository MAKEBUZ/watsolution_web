/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Address } from './address.entity';
import { PersonStatus } from './enumeration/person-status';

/**
 * A Person.
 */
@Entity('person')
export class Person extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'document_number', unique: true })
  documentNumber: string;

  @Column({ name: 'phone', nullable: true })
  phone?: string;

  @Column({ name: 'email', nullable: true })
  email?: string;

  @Column({ type: 'varchar', name: 'status', enum: PersonStatus })
  status?: PersonStatus;

  @Column({ type: 'timestamp', name: 'created_at', nullable: true })
  createdAt?: any;

  @Column({ name: 'subscriber_number', unique: true, nullable: true })
  subscriberNumber?: string;

  @Column({ name: 'stratum', type: 'int', nullable: true, default: 1 })
  stratum?: number;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'green_points', type: 'int', default: 0 })
  greenPoints?: number;

  @Column({ name: 'days_since_last_debt', type: 'int', default: 0 })
  daysSinceLastDebt?: number;

  @Column({ type: 'decimal', name: 'savings_percent', precision: 5, scale: 2, default: 0 })
  savingsPercent?: number;

  @ManyToOne(type => Address)
  address?: Address;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
