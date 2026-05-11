import { ApiProperty } from '@nestjs/swagger';
import { PersonDTO } from './person.dto';
import { InvoiceDTO } from './invoice.dto';

export class PortalMonthlyPointDTO {
  @ApiProperty()
  month: string;

  @ApiProperty()
  value: number;
}

export class PortalDataDTO {
  @ApiProperty({ type: () => PersonDTO })
  person: PersonDTO;

  @ApiProperty({ type: () => InvoiceDTO, nullable: true })
  currentInvoice: InvoiceDTO | null;

  @ApiProperty({ type: () => [InvoiceDTO] })
  invoiceHistory: InvoiceDTO[];

  @ApiProperty({ description: 'Total water consumption this month (m³) for this subscriber' })
  monthlyConsumption: number;

  @ApiProperty({ description: 'Service status: ACTIVE | INACTIVE | MOROSO' })
  serviceStatus: string;

  @ApiProperty({ type: () => [PortalMonthlyPointDTO], description: 'Last 6 months consumption trend' })
  consumptionTrend: PortalMonthlyPointDTO[];
}
