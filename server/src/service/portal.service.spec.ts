import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PortalController } from '../web/rest/portal.controller';
import { PortalService } from './portal.service';

describe('Portal account isolation', () => {
  const profiles = [
    { id: 10, userId: '42', email: 'owner@example.test' },
    { id: 20, userId: '99', email: 'other@example.test' },
  ];
  let people: any;
  let invoices: any;
  let meters: any;
  let trend: any;
  let service: PortalService;
  let controller: PortalController;

  beforeEach(() => {
    people = {
      find: jest.fn(async ({ where }) => profiles.filter(person => person.userId === where.userId)),
      findOne: jest.fn(async ({ where }) =>
        profiles.find(person => where.some(condition => Object.entries(condition).every(([key, value]) => person[key] === value))),
      ),
    };
    invoices = { find: jest.fn().mockResolvedValue([]), findOne: jest.fn().mockResolvedValue(null) };
    trend = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
    };
    meters = { findOne: jest.fn().mockResolvedValue(null), createQueryBuilder: jest.fn(() => trend) };
    service = new PortalService(people, invoices, meters);
    controller = new PortalController(service);
  });

  it.each(['42', 'owner@example.test', 'renamed-login'])('uses authenticated id when login is %s', async login => {
    const result = await controller.getDashboard({ user: { id: 99, login } } as any);
    expect(result.person.id).toBe(20);
    expect(people.find).toHaveBeenCalledWith({ where: { userId: '99' }, relations: { address: true }, take: 2 });
    for (const [query] of invoices.find.mock.calls) expect(query.where.person.id).toBe(20);
    expect(invoices.findOne.mock.calls[0][0].where.person.id).toBe(20);
    expect(meters.findOne.mock.calls[0][0].where.person.id).toBe(20);
    for (const [, params] of trend.where.mock.calls) expect(params.personId).toBe(20);
  });

  it.each([undefined, null, 0, -1, 1.5, '99', Number.MAX_SAFE_INTEGER + 1])('rejects invalid identity %s before querying', async id => {
    await expect(controller.getDashboard({ user: { id, login: '42' } } as any)).rejects.toBeInstanceOf(ForbiddenException);
    expect(people.find).not.toHaveBeenCalled();
    expect(people.findOne).not.toHaveBeenCalled();
    expect(invoices.find).not.toHaveBeenCalled();
  });

  it('does not fall back to matching email when the account has no linked profile', async () => {
    await expect(controller.getDashboard({ user: { id: 100, login: 'owner@example.test' } } as any)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(invoices.find).not.toHaveBeenCalled();
    expect(meters.findOne).not.toHaveBeenCalled();
  });

  it('fails closed when two profiles are linked to the same account', async () => {
    people.find.mockResolvedValue([
      { id: 20, userId: '99' },
      { id: 30, userId: '99' },
    ]);
    await expect(controller.getDashboard({ user: { id: 99, login: '42' } } as any)).rejects.toBeInstanceOf(ForbiddenException);
    expect(invoices.find).not.toHaveBeenCalled();
    expect(meters.findOne).not.toHaveBeenCalled();
  });
});
