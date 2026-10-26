import { Noticia } from '../../domain/noticia.entity';
import { NoticiaDTO } from '../dto/noticia.dto';
import { pickFields } from '../../security/entity-input';

export class NoticiaMapper {
  static fromDTOtoEntity(entityDTO: NoticiaDTO): Noticia {
    if (!entityDTO) {
      return;
    }
    const entity = new Noticia();
    Object.assign(entity, pickFields(entityDTO, ['id', 'title', 'summary', 'content', 'category', 'status', 'publishDate', 'imageUrl']));
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
