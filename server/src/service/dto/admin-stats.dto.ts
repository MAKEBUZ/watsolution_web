import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsDTO {
  @ApiProperty({ description: 'Total active users' })
  activeUsers: number;

  @ApiProperty({ description: 'Monthly revenue from paid invoices' })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Total water consumption this month (m3)' })
  totalConsumption: number;
}

export class MonthlyDataPointDTO {
  @ApiProperty()
  month: string;

  @ApiProperty()
  value: number;
}

export class DashboardChartDataDTO {
  @ApiProperty({ type: [MonthlyDataPointDTO] })
  consumptionTrend: MonthlyDataPointDTO[];

  @ApiProperty({ type: [MonthlyDataPointDTO] })
  monthlyRevenue: MonthlyDataPointDTO[];
}

export class UserWithStatusDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  activated: boolean;

  @ApiProperty()
  lastModifiedDate?: any;

  @ApiProperty({ description: 'ACTIVO | MOROSO | SUSPENDIDO' })
  userStatus: string;

  @ApiProperty({ description: 'USER | ADMIN' })
  role: string;

  @ApiProperty({ description: 'Subscriber number from linked Person' })
  subscriberNumber?: string;
}
