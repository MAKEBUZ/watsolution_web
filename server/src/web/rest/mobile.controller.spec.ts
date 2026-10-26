import { MobileController } from './mobile.controller';
import { Person } from '../../domain/person.entity';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../security/guards/roles.guard';

describe('Mobile assignment', () => {
  it('restricts roster and assignment to administrators despite the class operator role', () => {
    const guard = new RolesGuard(new Reflector());
    for (const method of ['assign', 'operators']) {
      for (const role of ['ROLE_OPERATOR', 'ROLE_USER', 'ROLE_ADMIN']) {
        const context = {
          getHandler: () => MobileController.prototype[method],
          getClass: () => MobileController,
          switchToHttp: () => ({ getRequest: () => ({ user: { authorities: [role] } }) }),
        };
        expect(guard.canActivate(context as any)).toBe(role === 'ROLE_ADMIN');
      }
    }
  });
  function fixture(person: unknown = { id: 7 }, operator: unknown = { authorities: [{ name: 'ROLE_OPERATOR' }] }) {
    const people = { findOne: jest.fn(async () => person), update: jest.fn() };
    const users = { findOne: jest.fn(async () => operator) };
    const db = { transaction: jest.fn(async work => work({ getRepository: type => (type === Person ? people : users) })) };
    return { controller: new MobileController(null, db as any, null), people, users, db };
  }
  it('serializes assignment against capture using the person row', async () => {
    const f = fixture();
    await expect(f.controller.assign({ personId: 7, operatorId: 2 })).resolves.toEqual({ assigned: true });
    expect(f.people.findOne).toHaveBeenCalledWith({ where: { id: 7 }, lock: { mode: 'pessimistic_write' } });
    expect(f.people.update).toHaveBeenCalledWith({ id: 7 }, { assignedOperatorId: 2 });
  });
  it('does not report success for a missing person', async () => {
    const f = fixture(null);
    await expect(f.controller.assign({ personId: 7, operatorId: null })).rejects.toThrow('Person not found');
    expect(f.people.update).not.toHaveBeenCalled();
  });
  it('rejects inactive or non-operator destinations', async () => {
    const f = fixture({ id: 7 }, null);
    await expect(f.controller.assign({ personId: 7, operatorId: 2 })).rejects.toThrow('Active operator required');
    expect(f.people.update).not.toHaveBeenCalled();
  });
  it('rejects malformed requests before opening a transaction', async () => {
    const f = fixture();
    for (const body of [null, {}, { personId: 7, operatorId: 2, role: 'ROLE_ADMIN' }]) {
      await expect(f.controller.assign(body as any)).rejects.toThrow();
    }
    expect(f.db.transaction).not.toHaveBeenCalled();
  });
});
