import { Address } from '../../domain/address.entity';
import { AddressDTO } from '../dto/address.dto';
import { pickFields } from '../../security/entity-input';

/**
 * A Address mapper object.
 */
export class AddressMapper {
  static fromDTOtoEntity(entityDTO: AddressDTO): Address {
    if (!entityDTO) {
      return;
    }
    const entity = new Address();
    Object.assign(entity, pickFields(entityDTO, ['id', 'neighborhood', 'street', 'houseNumber', 'city', 'latitude', 'longitude']));
    return entity;
  }

  static fromEntityToDTO(entity: Address): AddressDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new AddressDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
