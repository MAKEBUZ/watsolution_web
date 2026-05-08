import { Noticia } from '../../domain/noticia.entity';
import { NoticiaDTO } from '../dto/noticia.dto';

export class NoticiaMapper {
  static fromDTOtoEntity(entityDTO: NoticiaDTO): Noticia {
    if (!entityDTO) {
      return;
    }
    const entity = new Noticia();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: Noticia): NoticiaDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new NoticiaDTO();
    const fields = Object.getOwnPropertyNames(entity);
    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });
    return entityDTO;
  }
}
