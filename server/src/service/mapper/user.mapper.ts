import { User } from '../../domain/user.entity';
import { UserDTO } from '../dto/user.dto';
import { pickFields } from '../../security/entity-input';

/**
 * An User mapper object.
 */
export class UserMapper {
  static fromDTOtoEntity(userDTO: UserDTO): User {
    if (!userDTO) {
      return;
    }
    const user = new User();
    Object.assign(
      user,
      pickFields(userDTO, [
        'id',
        'login',
        'firstName',
        'lastName',
        'email',
        'activated',
        'langKey',
        'authorities',
        'password',
        'imageUrl',
        'activationKey',
        'resetKey',
        'resetDate',
      ]),
    );
    return user;
  }

  static fromEntityToDTO(user: User): UserDTO {
    if (!user) {
      return;
    }
    const userDTO = new UserDTO();

    const fields = Object.getOwnPropertyNames(user);

    fields.forEach(field => {
      userDTO[field] = user[field];
    });

    return userDTO;
  }
}
