import { allowedSortFields } from '../../domain/base/allowed-sort-fields';
import { RecordAccessGuard } from '../../security/guards/record-access.guard';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post as PostMethod,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PersonDTO } from '../../service/dto/person.dto';
import { CreatePersonWithAccountDTO } from '../../service/dto/create-person-with-account.dto';
import { PersonService } from '../../service/person.service';
import { AddressService } from '../../service/address.service';
import { AuthService } from '../../service/auth.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { matchingId } from '../../security/entity-input';

@Controller('api/people')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('people')
export class PersonController {
  logger = new Logger('PersonController');

  constructor(
    private readonly personService: PersonService,
    private readonly addressService: AddressService,
    private readonly authService: AuthService,
  ) {}

  @Get('/me')
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  @ApiOperation({ summary: 'Get person linked to the current authenticated user' })
  @ApiResponse({ status: 200, description: 'Person record for the logged-in user', type: PersonDTO })
  async getMyPerson(@Req() req: Request): Promise<PersonDTO | undefined> {
    return await this.personService.findByFields({
      where: { userId: String((req.user as any).id) } as any,
    });
  }

  @Get('/')
  @Roles(RoleType.ADMIN, RoleType.OPERATOR)
  @ApiResponse({ status: 200, description: 'List all records', type: PersonDTO })
  async getAll(@Req() req: Request): Promise<PersonDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC', allowedSortFields.person);
    const [results, count] = await this.personService.findAndCount({
      where: (req.user.authorities.includes(RoleType.ADMIN) ? {} : { assignedOperatorId: req.user.id }) as any,
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @UseGuards(RecordAccessGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  @ApiResponse({ status: 200, description: 'The found record', type: PersonDTO })
  async getOne(@Param('id') id: number): Promise<PersonDTO> {
    return await this.personService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create person with address and auth user' })
  @ApiResponse({ status: 201, description: 'Record created successfully', type: PersonDTO })
  @ApiResponse({ status: 400, description: 'Email or document already in use' })
  async post(@Req() req: Request, @Body() dto: CreatePersonWithAccountDTO): Promise<PersonDTO> {
    const created = await this.personService.createWithAccount(dto, req.user.login);

    HeaderUtil.addEntityCreatedHeaders(req.res, 'Person', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Update person (and address if provided)' })
  @ApiResponse({ status: 200, description: 'Record updated successfully', type: PersonDTO })
  async put(@Req() req: Request, @Body() personDTO: PersonDTO): Promise<PersonDTO> {
    matchingId(personDTO);
    // If address data is embedded, persist it first so the FK is correct
    if (personDTO.address?.id) {
      await this.addressService.update(personDTO.address, req.user?.login);
    } else if (personDTO.address && !personDTO.address.id) {
      const savedAddress = await this.addressService.save(personDTO.address, req.user?.login);
      personDTO.address = savedAddress;
    }

    HeaderUtil.addEntityCreatedHeaders(req.res, 'Person', personDTO.id);
    return await this.personService.update(personDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Update person by id' })
  @ApiResponse({ status: 200, description: 'Record updated successfully', type: PersonDTO })
  async putId(@Req() req: Request, @Body() personDTO: PersonDTO, @Param('id') id: string): Promise<PersonDTO> {
    personDTO.id = matchingId(personDTO, id);
    if (personDTO.address?.id) {
      await this.addressService.update(personDTO.address, req.user?.login);
    } else if (personDTO.address && !personDTO.address.id) {
      const savedAddress = await this.addressService.save(personDTO.address, req.user?.login);
      personDTO.address = savedAddress;
    }

    HeaderUtil.addEntityCreatedHeaders(req.res, 'Person', personDTO.id);
    return await this.personService.update(personDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete person' })
  @ApiResponse({ status: 204, description: 'Record deleted successfully' })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Person', id);
    return await this.personService.deleteById(id);
  }
}
