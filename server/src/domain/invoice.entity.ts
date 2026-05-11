/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Meter } from './meter.entity';
import { Person } from './person.entity';
import { InvoiceStatus } from './enumeration/invoice-status';

/**
 * A Invoice.
 */
@Entity('invoice')
export class Invoice extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'date', name: 'issue_date' })
  issueDate: any;

  @Column({ type: 'date', name: 'due_date' })
  dueDate: any;

  @Column({ type: 'decimal', name: 'consumption_m_3', precision: 10, scale: 2 })
  consumptionM3: number;

  @Column({ type: 'decimal', name: 'amount_due', precision: 10, scale: 2 })
  amountDue: number;

  @Column({ type: 'decimal', name: 'rate_per_m3', precision: 10, scale: 2, nullable: true })
  ratePerM3?: number;

  @Column({ type: 'decimal', name: 'fixed_charge', precision: 10, scale: 2, nullable: true })
  fixedCharge?: number;

  @Column({ type: 'decimal', name: 'subsidy_percent', precision: 5, scale: 4, nullable: true })
  subsidyPercent?: number;

  @Column({ type: 'decimal', name: 'additional_charges', precision: 10, scale: 2, nullable: true })
  additionalCharges?: number;

  @Column({ type: 'varchar', name: 'pdf_url', nullable: true })
  pdfUrl?: string;

  @Column({ type: 'varchar', name: 'status', enum: InvoiceStatus })
  status?: InvoiceStatus;

  @Column({ type: 'timestamp', name: 'created_at', nullable: true })
  createdAt?: any;

  @ManyToOne(type => Meter)
  meter?: Meter;

  @ManyToOne(type => Person)
  person?: Person;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
