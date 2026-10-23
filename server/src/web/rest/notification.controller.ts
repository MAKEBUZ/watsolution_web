import { Controller, Get, Header, MessageEvent, Patch, Req, Query, Sse, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable, interval, merge, map } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { NotificationService } from '../../service/notification.service';
import { Notification } from '../../domain/notification.entity';
import { config } from '../../config';

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
}
