import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { NotificationService } from '../../service/notification.service';
import { Notification } from '../../domain/notification.entity';

@ApiTags('notifications')
@Controller('api/notifications')
@UseInterceptors(LoggingInterceptor)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notifications for current user' })
  async getMyNotifications(@Req() req: any): Promise<Notification[]> {
    return this.notificationService.getForUser(req.user.login);
  }

  @Patch('/read-all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Req() req: any): Promise<void> {
    return this.notificationService.markAllRead(req.user.login);
  }

  @Get('/unread-count')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@Req() req: any): Promise<{ count: number }> {
    const count = await this.notificationService.countUnread(req.user.login);
    return { count };
  }

  @Get('/page')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  async page(@Req() req: any, @Query('page') page = '0', @Query('size') size = '10') {
    const p = Number(page),
      s = Number(size);
    if (!Number.isSafeInteger(p) || p < 0 || !Number.isSafeInteger(s) || s < 1 || s > 100)
      throw new BadRequestException('Invalid pagination');
    return this.notificationService.page(req.user.login, p, s);
  }

  @Delete('/read')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  async removeRead(@Req() req: any) {
    await this.notificationService.removeRead(req.user.login);
  }

  @Patch('/:id/read')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  async read(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.notificationService.markRead(req.user.login, id);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR)
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.notificationService.remove(req.user.login, id);
  }
}
