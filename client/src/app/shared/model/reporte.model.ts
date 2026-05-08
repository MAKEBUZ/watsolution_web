import { type IPerson } from '@/shared/model/person.model';
import { type ReporteType } from '@/shared/model/enumerations/reporte-type.model';
import { type ReporteStatus } from '@/shared/model/enumerations/reporte-status.model';

export interface IReporte {
  id?: number;
  type?: keyof typeof ReporteType | null;
  description?: string | null;
  status?: keyof typeof ReporteStatus | null;
  createdAt?: Date | null;
  person?: IPerson | null;
}

export class Reporte implements IReporte {
  constructor(
    public id?: number,
    public type?: keyof typeof ReporteType | null,
    public description?: string | null,
    public status?: keyof typeof ReporteStatus | null,
    public createdAt?: Date | null,
    public person?: IPerson | null,
  ) {}
}
