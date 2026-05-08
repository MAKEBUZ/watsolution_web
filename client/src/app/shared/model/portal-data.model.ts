import { type IPerson } from '@/shared/model/person.model';
import { type IInvoice } from '@/shared/model/invoice.model';

export interface IPortalData {
  person: IPerson;
  currentInvoice: IInvoice | null;
  invoiceHistory: IInvoice[];
}
