import { ApiProperty } from '@nestjs/swagger';
import { PersonDTO } from './person.dto';
import { InvoiceDTO } from './invoice.dto';

export class PortalDataDTO {
  @ApiProperty({ type: () => PersonDTO })
  person: PersonDTO;

  @ApiProperty({ type: () => InvoiceDTO, nullable: true })
  currentInvoice: InvoiceDTO | null;

  @ApiProperty({ type: () => [InvoiceDTO] })
  invoiceHistory: InvoiceDTO[];
}
