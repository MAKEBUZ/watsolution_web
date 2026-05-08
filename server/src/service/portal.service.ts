import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../domain/person.entity';
import { Invoice } from '../domain/invoice.entity';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { PersonMapper } from '../service/mapper/person.mapper';
import { InvoiceMapper } from '../service/mapper/invoice.mapper';
import { PortalDataDTO } from '../service/dto/portal-data.dto';

@Injectable()
export class PortalService {
  logger = new Logger('PortalService');

  constructor(
    @InjectRepository(Person) private personRepository: Repository<Person>,
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
  ) {}

  async getPortalData(userLogin: string): Promise<PortalDataDTO> {
    const person = await this.personRepository.findOne({
      relations: { address: true },
      where: [{ userId: userLogin }, { email: userLogin }],
    });

    if (!person) {
      throw new HttpException(
        'No se encontró perfil de suscriptor para este usuario. Contacte al administrador.',
        HttpStatus.NOT_FOUND,
      );
    }

    const pendingInvoices = await this.invoiceRepository.find({
      where: { person: { id: person.id }, status: InvoiceStatus.PENDING },
      order: { dueDate: 'DESC' } as any,
      take: 1,
      relations: { meter: true, person: true },
    });

    const historyInvoices = await this.invoiceRepository.find({
      where: { person: { id: person.id } },
      order: { issueDate: 'DESC' } as any,
      take: 3,
      relations: { meter: true, person: true },
    });

    return {
      person: PersonMapper.fromEntityToDTO(person),
      currentInvoice: pendingInvoices.length > 0 ? InvoiceMapper.fromEntityToDTO(pendingInvoices[0]) : null,
      invoiceHistory: historyInvoices.map(inv => InvoiceMapper.fromEntityToDTO(inv)),
    };
  }
}
