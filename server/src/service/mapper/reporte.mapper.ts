import { Reporte } from '../../domain/reporte.entity';
import { ReporteDTO } from '../dto/reporte.dto';

export class ReporteMapper {
  static fromDTOtoEntity(entityDTO: ReporteDTO): Reporte {
    if (!entityDTO) {
      return;
    }
    const entity = new Reporte();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
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
