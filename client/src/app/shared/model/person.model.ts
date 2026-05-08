import { type IAddress } from '@/shared/model/address.model';

import { type PersonStatus } from '@/shared/model/enumerations/person-status.model';
export interface IPerson {
  id?: number;
  fullName?: string;
  documentNumber?: string;
  phone?: string | null;
  email?: string | null;
  status?: keyof typeof PersonStatus | null;
  createdAt?: Date | null;
  subscriberNumber?: string | null;
  stratum?: number | null;
  userId?: string | null;
  greenPoints?: number | null;
  daysSinceLastDebt?: number | null;
  savingsPercent?: number | null;
  address?: IAddress | null;
}

export class Person implements IPerson {
  constructor(
    public id?: number,
    public fullName?: string,
    public documentNumber?: string,
    public phone?: string | null,
    public email?: string | null,
    public status?: keyof typeof PersonStatus | null,
    public createdAt?: Date | null,
    public subscriberNumber?: string | null,
    public stratum?: number | null,
    public userId?: string | null,
    public greenPoints?: number | null,
    public daysSinceLastDebt?: number | null,
    public savingsPercent?: number | null,
    public address?: IAddress | null,
  ) {}
}
