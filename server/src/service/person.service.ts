import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Person } from '../domain/person.entity';
import { PersonDTO } from '../service/dto/person.dto';
import { PersonMapper } from '../service/mapper/person.mapper';
import { matchingId, pickFields } from '../security/entity-input';
import { randomBytes } from 'crypto';
import { Address } from '../domain/address.entity';
import { User } from '../domain/user.entity';
import { CreatePersonWithAccountDTO } from './dto/create-person-with-account.dto';
import { PersonStatus } from '../domain/enumeration/person-status';
import { encodePassword } from '../security/password-util';

const relations = {
  address: true,
} as const;

@Injectable()
export class PersonService {
  logger = new Logger('PersonService');

  constructor(@InjectRepository(Person) private personRepository: Repository<Person>) {}

  async createWithAccount(dto: CreatePersonWithAccountDTO, creator: string): Promise<PersonDTO> {
    const login = dto.email.trim().toLowerCase();
    const password = await encodePassword(randomBytes(48).toString('base64url'));
    try {
      return await this.personRepository.manager.transaction('SERIALIZABLE', async manager => {
        const users = manager.getRepository(User);
        if (await users.exists({ where: [{ login }, { email: login }] })) {
          throw new HttpException('Account already exists', HttpStatus.BAD_REQUEST);
        }
        const audit = { createdBy: creator, lastModifiedBy: creator };
        const address = await manager.getRepository(Address).save({
          ...pickFields<Address>(dto, ['neighborhood', 'street', 'houseNumber', 'city']),
          ...audit,
        });
        const user = await users.save({
          login,
          email: login,
          password,
          firstName: dto.fullName,
          activated: false,
          authorities: [{ name: 'ROLE_USER' }],
          ...audit,
        });
        const person = await manager.getRepository(Person).save({
          ...pickFields<Person>(dto, ['fullName', 'documentNumber', 'phone', 'subscriberNumber']),
          email: login,
          stratum: dto.stratum ?? 1,
          status: PersonStatus.ACTIVE,
          createdAt: new Date(),
          address,
          userId: String(user.id),
          ...audit,
        });
        return PersonMapper.fromEntityToDTO(person);
      });
    } catch (error) {
      if (error?.code === '23505' || error?.code === '40001') {
        throw new HttpException('Record already exists or changed. Review and retry.', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  async findById(id: number): Promise<PersonDTO | undefined> {
    const result = await this.personRepository.findOne({
      relations,
      where: { id },
    });
    return PersonMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<PersonDTO>): Promise<PersonDTO | undefined> {
    const result = await this.personRepository.findOne(options);
    return PersonMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<PersonDTO>): Promise<[PersonDTO[], number]> {
    const resultList = await this.personRepository.findAndCount({ ...options, relations });
    const personDTO: PersonDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(person => personDTO.push(PersonMapper.fromEntityToDTO(person)));
      resultList[0] = personDTO;
    }
    return resultList;
  }

  async save(personDTO: PersonDTO, creator?: string): Promise<PersonDTO | undefined> {
    const entity = PersonMapper.fromDTOtoEntity(personDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.personRepository.save(entity);
    return PersonMapper.fromEntityToDTO(result);
  }

  async update(personDTO: PersonDTO, updater?: string): Promise<PersonDTO | undefined> {
    const id = matchingId(personDTO);
    if (!(await this.personRepository.existsBy({ id }))) throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
    const entity = PersonMapper.fromDTOtoEntity(
      pickFields<PersonDTO>(personDTO, [
        'id',
        'fullName',
        'documentNumber',
        'phone',
        'email',
        'status',
        'subscriberNumber',
        'stratum',
        'address',
      ]),
    );
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.personRepository.save(entity);
    return PersonMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.personRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
