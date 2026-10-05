import {
  Body,
  BadRequestException,
  NotFoundException,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { UserDTO } from '../../service/dto/user.dto';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { UserService } from '../../service/user.service';
import { DataSource } from 'typeorm';
import { AuthSession } from '../../domain/auth-session.entity';

@Controller('api/admin/users')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('user-resource')
export class UserController {
  logger = new Logger('UserController');

  constructor(private readonly userService: UserService, private readonly db: DataSource) {}

  private fields(input: UserDTO): Partial<UserDTO> {
    if (!Array.isArray(input.authorities) || input.authorities.some(role => !['ROLE_USER', 'ROLE_OPERATOR', 'ROLE_ADMIN'].includes(role)) || typeof input.activated !== 'boolean') throw new BadRequestException('Invalid account permissions');
    return { login: input.login, email: input.email, firstName: input.firstName, lastName: input.lastName, langKey: input.langKey, activated: input.activated, authorities: input.authorities };
  }

  @Get('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get the list of users' })
  @ApiResponse({
    status: 200,
    description: 'List all users',
    type: UserDTO,
  })
  async getAllUsers(@Req() req: Request): Promise<UserDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.userService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Post('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: UserDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createUser(@Req() req: Request, @Body() userDTO: UserDTO): Promise<UserDTO> {
    if (userDTO.id != null) throw new BadRequestException('New account cannot include an id');
    const created = await this.userService.save({ ...this.fields(userDTO), password: userDTO.password } as UserDTO, req.user?.login, true);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'User', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: UserDTO,
  })
  async updateUser(@Req() req: Request, @Body() userDTO: UserDTO): Promise<UserDTO> {
    const userOnDb = await this.userService.findByFields({ where: { login: userDTO.login } });
    let updated = false;
    if (userOnDb && userOnDb.id) {
      userDTO = { ...userOnDb, ...this.fields(userDTO), id: userOnDb.id, password: userOnDb.password };
      updated = true;
    } else {
      throw new NotFoundException('Account not found');
    }
    const createdOrUpdated = await this.userService.update(userDTO, req.user?.login);
    await this.db.getRepository(AuthSession).update({ userId: userOnDb.id }, { revoked: true });
    if (updated) {
      HeaderUtil.addEntityUpdatedHeaders(req.res, 'User', createdOrUpdated.id);
    } else {
      HeaderUtil.addEntityCreatedHeaders(req.res, 'User', createdOrUpdated.id);
    }
    return createdOrUpdated;
  }

  @Get('/:login')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: UserDTO,
  })
  async getUser(@Param('login') loginValue: string): Promise<UserDTO> {
    return await this.userService.find({ where: { login: loginValue } });
  }

  @Delete('/:login')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
    type: UserDTO,
  })
  async deleteUser(@Req() req: Request, @Param('login') loginValue: string): Promise<UserDTO> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'User', loginValue);
    const userToDelete = await this.userService.find({ where: { login: loginValue } });
    return await this.userService.delete(userToDelete);
  }
}
