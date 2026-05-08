import { type IPerson } from '@/shared/model/person.model';
import { type IAddress } from '@/shared/model/address.model';

export interface IMeter {
  id?: number;
  waterMeasure?: number;
  readingDate?: Date;
  observation?: string | null;
  createdAt?: Date | null;
  person?: IPerson | null;
  address?: IAddress | null;
}

export class Meter implements IMeter {
  constructor(
    public id?: number,
    public waterMeasure?: number,
    public readingDate?: Date,
    public observation?: string | null,
    public createdAt?: Date | null,
    public person?: IPerson | null,
    public address?: IAddress | null,
  ) {}
}
