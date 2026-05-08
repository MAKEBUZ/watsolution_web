import axios from 'axios';
import { type IActivityLog } from '@/shared/model/activity-log.model';

const baseUrl = 'api/admin';

export interface IAdminStats {
  activeUsers: number;
  monthlyRevenue: number;
  totalConsumption: number;
  efficiency: number;
}

export interface IUserWithStatus {
  id: number;
  login: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  activated: boolean;
  lastModifiedDate?: string;
  userStatus: 'ACTIVO' | 'MOROSO' | 'SUSPENDIDO';
  role: 'USER' | 'ADMIN';
  subscriberNumber?: string;
}

export interface IBillingForm {
  personId: number;
  meterId?: number;
  prevReading: number;
  currentReading: number;
  rate: number;
  fixedCharge: number;
  subsidy?: number;
  surcharges?: number;
}

export default class AdminService {
  public getStats(): Promise<IAdminStats> {
    return axios.get(`${baseUrl}/stats`).then(r => r.data);
  }

  public getActivity(limit = 10): Promise<IActivityLog[]> {
    return axios.get(`${baseUrl}/activity?limit=${limit}`).then(r => r.data);
  }

  public getUsersWithStatus(): Promise<IUserWithStatus[]> {
    return axios.get(`${baseUrl}/users-with-status`).then(r => r.data);
  }

  public generateInvoice(dto: IBillingForm): Promise<any> {
    return axios.post(`${baseUrl}/billing/generate`, dto).then(r => r.data);
  }
}
