import { Reporte } from '../../domain/reporte.entity';
import { ReporteDTO } from '../dto/reporte.dto';
import { matchingId, pickFields } from '../../security/entity-input';

export class ReporteMapper {
  static fromDTOtoEntity(entityDTO: ReporteDTO): Reporte {
    if (!entityDTO) {
      return;
    }
    const entity = new Reporte();
    Object.assign(entity, pickFields(entityDTO, ['id', 'type', 'description', 'status', 'createdAt']));
    if (entityDTO.person) entity.person = { id: matchingId(entityDTO.person) } as any;
    return entity;
  }

  static fromEntityToDTO(entity: Reporte): ReporteDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new ReporteDTO();
    const fields = Object.getOwnPropertyNames(entity);
    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });
    return entityDTO;
  }
}
