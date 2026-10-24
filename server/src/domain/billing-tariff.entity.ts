import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Immutable versions: offline receipts retain the tariff prepared for their journey. */
@Entity('billing_tariff')
export class BillingTariff {
  @PrimaryColumn({ type: 'varchar', length: 36 }) id: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) rate: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) fixedCharge: number;
  @Column() createdAt: Date;
  @Column() createdBy: string;
}
