import { type ActivityAction } from '@/shared/model/enumerations/activity-action.model';

export interface IActivityLog {
  id?: number;
  action?: keyof typeof ActivityAction | null;
  description?: string;
  reference?: string | null;
  amount?: number | null;
  personName?: string | null;
  createdAt?: Date | null;
}
