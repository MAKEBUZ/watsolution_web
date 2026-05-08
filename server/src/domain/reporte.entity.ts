/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { Person } from './person.entity';
import { ReporteType } from './enumeration/reporte-type';
import { ReporteStatus } from './enumeration/reporte-status';

/**
 * A Reporte.
 */
@Entity('reporte')
export class Reporte extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', name: 'type', enum: ReporteType })
  type: ReporteType;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', name: 'status', enum: ReporteStatus, default: ReporteStatus.PENDING })
  status?: ReporteStatus;

  @Column({ type: 'timestamp', name: 'created_at', nullable: true })
  createdAt?: any;

  @ManyToOne(type => Person)
  person?: Person;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
