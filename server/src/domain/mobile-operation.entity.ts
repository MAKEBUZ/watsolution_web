import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('mobile_operation')
export class MobileOperation {
  @PrimaryColumn({ type: 'varchar', length: 36 }) id: string;
  @PrimaryColumn({ type: 'integer' }) userId: number;
  @Column({ type: 'varchar', length: 64 }) payloadHash: string;
  @Column() personId: number;
  @Column({ type: 'text' }) result: string;
  @Column() createdAt: Date;
}
