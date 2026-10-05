import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('auth_session')
export class AuthSession {
  @PrimaryColumn({ type: 'varchar', length: 36 }) id: string;
  @Index() @Column() userId: number;
  @Column({ type: 'varchar', length: 64 }) refreshHash: string;
  @Column({ type: 'text', default: '[]' }) usedRefreshHashes: string;
  @Column() expiresAt: Date;
  @Column({ default: false }) revoked: boolean;
}
