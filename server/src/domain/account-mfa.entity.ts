import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('account_mfa')
export class AccountMfa {
  @PrimaryColumn({ type: 'integer' }) userId: number;
  @Column({ default: false }) enabled: boolean;
  @Column({ type: 'text', nullable: true }) secretCipher: string | null;
  @Column({ type: 'text', nullable: true }) pendingCipher: string | null;
  @Column({ type: 'timestamp', nullable: true }) pendingExpiresAt: Date | null;
  @Column({ type: 'bigint', default: -1 }) lastStep: number;
  @Column({ type: 'text', default: '[]' }) recoveryHashes: string;
}
