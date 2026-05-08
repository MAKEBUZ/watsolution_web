import { type IMeter } from '@/shared/model/meter.model';
import { type IPerson } from '@/shared/model/person.model';

import { type InvoiceStatus } from '@/shared/model/enumerations/invoice-status.model';
export interface IInvoice {
  id?: number;
  issueDate?: Date;
  dueDate?: Date;
  consumptionM3?: number;
  amountDue?: number;
  status?: keyof typeof InvoiceStatus | null;
  createdAt?: Date | null;
  meter?: IMeter | null;
  person?: IPerson | null;
}

export class Invoice implements IInvoice {
  constructor(
    public id?: number,
    public issueDate?: Date,
    public dueDate?: Date,
    public consumptionM3?: number,
    public amountDue?: number,
    public status?: keyof typeof InvoiceStatus | null,
    public createdAt?: Date | null,
    public meter?: IMeter | null,
    public person?: IPerson | null,
  ) {}
}
