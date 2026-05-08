/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

/**
 * A Address.
 */
@Entity('address')
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'neighborhood' })
  neighborhood: string;

  @Column({ name: 'street', nullable: true })
  street?: string;

  @Column({ name: 'house_number', nullable: true })
  houseNumber?: string;

  @Column({ name: 'city' })
  city: string;

  @Column({ type: 'decimal', name: 'latitude', precision: 10, scale: 2, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', name: 'longitude', precision: 10, scale: 2, nullable: true })
  longitude?: number;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
