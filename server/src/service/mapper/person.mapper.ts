import { Person } from '../../domain/person.entity';
import { PersonDTO } from '../dto/person.dto';
import { pickFields } from '../../security/entity-input';
import { AddressMapper } from './address.mapper';

/**
 * A Person mapper object.
 */
export class PersonMapper {
  static fromDTOtoEntity(entityDTO: PersonDTO): Person {
    if (!entityDTO) {
      return;
    }
    const entity = new Person();
    Object.assign(
      entity,
      pickFields(entityDTO, [
        'id',
        'fullName',
        'documentNumber',
        'phone',
        'email',
        'status',
        'createdAt',
        'subscriberNumber',
        'stratum',
        'userId',
        'greenPoints',
        'daysSinceLastDebt',
        'savingsPercent',
      ]),
    );
    if (entityDTO.address) entity.address = AddressMapper.fromDTOtoEntity(entityDTO.address);
    return entity;
  }

  static fromEntityToDTO(entity: Person): PersonDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new PersonDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
