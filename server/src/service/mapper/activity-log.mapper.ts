import { ActivityLog } from '../../domain/activity-log.entity';
import { ActivityLogDTO } from '../dto/activity-log.dto';

export class ActivityLogMapper {
  static fromDTOtoEntity(entityDTO: ActivityLogDTO): ActivityLog {
    if (!entityDTO) {
      return;
    }
    const entity = new ActivityLog();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: ActivityLog): ActivityLogDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new ActivityLogDTO();
    const fields = Object.getOwnPropertyNames(entity);
    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });
    return entityDTO;
  }
}
