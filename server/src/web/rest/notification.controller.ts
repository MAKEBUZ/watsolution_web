import { Controller, Get, MessageEvent, Param, Patch, Query, Sse, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
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

  @Sse('/stream')
  @ApiOperation({ summary: 'SSE stream for real-time notifications (token via query param)' })
  stream(@Query('token') token: string): Observable<MessageEvent> {
    let userLogin = 'anonymous';
    try {
      const secret = Buffer.from(config['jhipster.security.authentication.jwt.base64-secret'], 'base64').toString('utf-8');
      const decoded = jwt.verify(token, secret) as any;
      userLogin = decoded.sub ?? decoded.login ?? decoded.username ?? 'anonymous';
    } catch {
      // invalid token — stream will receive nothing meaningful
    }
    return this.notificationService.subscribe(userLogin) as unknown as Observable<MessageEvent>;
  }

  @Get('/')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notifications for current user' })
  async getMyNotifications(@Query('login') login: string): Promise<Notification[]> {
    return this.notificationService.getForUser(login);
  }

  @Patch('/read-all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Query('login') login: string): Promise<void> {
    return this.notificationService.markAllRead(login);
  }

  @Get('/unread-count')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@Query('login') login: string): Promise<{ count: number }> {
    const count = await this.notificationService.countUnread(login);
    return { count };
  }
}
