import { Meter } from '../../domain/meter.entity';
import { MeterDTO } from '../dto/meter.dto';

/**
 * A Meter mapper object.
 */
export class MeterMapper {
  static fromDTOtoEntity(entityDTO: MeterDTO): Meter {
    if (!entityDTO) {
      return;
    }
    const entity = new Meter();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: Meter): MeterDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new MeterDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
