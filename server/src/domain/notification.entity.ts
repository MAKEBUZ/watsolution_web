import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type NotificationType = 'invoice.created' | 'invoice.due_soon' | 'invoice.overdue' | 'invoice.paid';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_login', type: 'varchar', length: 100 })
  userLogin: string;

  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'invoice_id', nullable: true, type: 'int' })
  invoiceId?: number;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
