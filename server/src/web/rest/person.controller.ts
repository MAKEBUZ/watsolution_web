import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
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
import { PersonService } from '../../service/person.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/people')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('people')
export class PersonController {
  logger = new Logger('PersonController');

  constructor(private readonly personService: PersonService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: PersonDTO,
  })
  async getAll(@Req() req: Request): Promise<PersonDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.personService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: PersonDTO,
  })
  async getOne(@Param('id') id: number): Promise<PersonDTO> {
    return await this.personService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create person' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: PersonDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() personDTO: PersonDTO): Promise<PersonDTO> {
    const created = await this.personService.save(personDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Person', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update person' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: PersonDTO,
  })
  async put(@Req() req: Request, @Body() personDTO: PersonDTO): Promise<PersonDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Person', personDTO.id);
    return await this.personService.update(personDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update person with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: PersonDTO,
  })
  async putId(@Req() req: Request, @Body() personDTO: PersonDTO): Promise<PersonDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Person', personDTO.id);
    return await this.personService.update(personDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete person' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Person', id);
    return await this.personService.deleteById(id);
  }
}
