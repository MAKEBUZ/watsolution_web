import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Person } from '../domain/person.entity';
import { PersonDTO } from '../service/dto/person.dto';
import { PersonMapper } from '../service/mapper/person.mapper';

const relations = {
  address: true,
} as const;

@Injectable()
export class PersonService {
  logger = new Logger('PersonService');

  constructor(@InjectRepository(Person) private personRepository: Repository<Person>) {}

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
    const entity = PersonMapper.fromDTOtoEntity(personDTO);
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
