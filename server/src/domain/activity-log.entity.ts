/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { ActivityAction } from './enumeration/activity-action';

/**
 * An ActivityLog.
 */
@Entity('activity_log')
export class ActivityLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', name: 'action', enum: ActivityAction })
  action: ActivityAction;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'reference', nullable: true })
  reference?: string;

  @Column({ type: 'decimal', name: 'amount', precision: 12, scale: 2, nullable: true })
  amount?: number;

  @Column({ name: 'person_name', nullable: true })
  personName?: string;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: any;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
