import axios from 'axios';
import { type IPortalData } from '@/shared/model/portal-data.model';
import { type IReporte } from '@/shared/model/reporte.model';

const baseUrl = 'api/portal';

export default class PortalService {
  public getDashboard(): Promise<IPortalData> {
    return axios.get(`${baseUrl}/dashboard`).then(r => r.data);
  }

  public createReporte(data: IReporte): Promise<IReporte> {
    return axios.post(`${baseUrl}/reportes`, data).then(r => r.data);
  }
}
