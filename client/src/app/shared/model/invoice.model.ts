import { type IMeter } from '@/shared/model/meter.model';
import { type IPerson } from '@/shared/model/person.model';

import { type InvoiceStatus } from '@/shared/model/enumerations/invoice-status.model';
export interface IInvoice {
  id?: number;
  issueDate?: Date;
  dueDate?: Date;
  consumptionM3?: number;
  amountDue?: number;
  ratePerM3?: number;
  fixedCharge?: number;
  subsidyPercent?: number;
  additionalCharges?: number;
  pdfUrl?: string | null;
  status?: keyof typeof InvoiceStatus | null;
  createdAt?: Date | null;
  meter?: IMeter | null;
  person?: IPerson | null;
  boldOrderId?: string | null;
  boldTransactionId?: string | null;
}

export class Invoice implements IInvoice {
  constructor(
    public id?: number,
    public issueDate?: Date,
    public dueDate?: Date,
    public consumptionM3?: number,
    public amountDue?: number,
    public ratePerM3?: number,
    public fixedCharge?: number,
    public subsidyPercent?: number,
    public additionalCharges?: number,
    public pdfUrl?: string | null,
    public status?: keyof typeof InvoiceStatus | null,
    public createdAt?: Date | null,
    public meter?: IMeter | null,
    public person?: IPerson | null,
    public boldOrderId?: string | null,
    public boldTransactionId?: string | null,
  ) {}
}
