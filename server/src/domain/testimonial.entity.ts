import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('testimonial')
export class Testimonial {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 120 }) name: string;
  @Column({ length: 120 }) role: string;
  @Column({ length: 160 }) company: string;
  @Column({ type: 'text' }) text: string;
  @Column({ default: false }) published: boolean;
  @Column({ default: 0 }) position: number;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
