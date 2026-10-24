import { AdminStatsService } from './admin-stats.service';
import { AdminController } from '../web/rest/admin.controller';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../security/guards/roles.guard';

describe('Activity pagination', () => {
  it('uses bounded pages and stable ordering for events with identical dates', async () => {
    const repo = { findAndCount: jest.fn().mockResolvedValue([[{ id: 21, action: 'PAGO_FACTURA', description: 'Fixture', amount: 0 }], 21]) };
    const service = new AdminStatsService(null, null, null, null, repo as any);
    const result = await service.getActivityPage(2, 10);
    expect(repo.findAndCount).toHaveBeenCalledWith({ order: { createdAt: 'DESC', id: 'DESC' }, skip: 20, take: 10 });
    expect(result.total).toBe(21);
    expect(result.items[0].amount).toBe(0);
  });
  it('rejects invalid page requests before querying and restricts the endpoint to administrators', async () => {
    const service = { getActivityPage: jest.fn() };
    const controller = Object.create(AdminController.prototype);
    controller.adminStatsService = service;
    for (const [page, size] of [['-1', '10'], ['0', '101'], ['0.5', '10'], ['0', '0'], ['NaN', '10']])
      await expect(controller.activityPage(page, size)).rejects.toThrow();
    expect(service.getActivityPage).not.toHaveBeenCalled();
    const guard = new RolesGuard(new Reflector());
    for (const role of ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_OPERATOR']) {
      expect(guard.canActivate({ getClass: () => AdminController, getHandler: () => AdminController.prototype.activityPage,
        switchToHttp: () => ({ getRequest: () => ({ user: { authorities: [role] } }) }) } as any)).toBe(role === 'ROLE_ADMIN');
    }
  });
});
