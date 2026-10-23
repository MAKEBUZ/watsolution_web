import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { PageRequest } from './pagination.entity';
import { allowedSortFields } from './allowed-sort-fields';

describe('PageRequest', () => {
  it('passing default number parameters', () => {
    const pageRequest = new PageRequest(0, 20, 'id,ASC');
    expect(pageRequest.page).toBe(0);
    expect(pageRequest.size).toBe(20);
    expect(pageRequest.sort.asOrder()).toMatchObject({ id: 'ASC' });
  });

  it('passing default strings parameters', () => {
    const pageRequest = new PageRequest('0', '20', 'id,ASC');
    expect(pageRequest.page).toBe(0);
    expect(pageRequest.size).toBe(20);
    expect(pageRequest.sort.asOrder()).toMatchObject({ id: 'ASC' });
  });

  it('passing non default strings parameters', () => {
    const pageRequest = new PageRequest('10', '30', 'fullName,DESC', allowedSortFields.person);
    expect(pageRequest.page).toBe(10);
    expect(pageRequest.size).toBe(30);
    expect(pageRequest.sort.asOrder()).toMatchObject({ fullName: 'DESC' });
  });

  it.each([
    'id; DROP TABLE person,ASC',
    'id,DESC;SELECT pg_sleep(10)',
    'password,ASC',
    'resetKey,ASC',
    '__proto__,ASC',
    'constructor,ASC',
    'id,ASC,extra',
  ])('rejects unsafe or secret sort fields: %s', sort => {
    expect(() => new PageRequest(0, 20, sort, allowedSortFields.user)).toThrow('Invalid sort');
  });
  it.each([
    ['-1', '20'],
    ['0', '0'],
    ['0', '501'],
    ['1 OR 1=1', '20'],
    ['0', '1e5'],
    ['0', '20foo'],
    [[], '20'],
    [{ value: 0 }, '20'],
    ['9007199254740991', '20'],
  ])('rejects malformed or unbounded pagination', (page, size) => {
    expect(() => new PageRequest(page as any, size as any, 'id,ASC')).toThrow('Invalid pagination');
  });
  it('preserves case-insensitive sorting, relation columns and the client secondary id sort', () => {
    expect(new PageRequest(0, 200, ['address.id,desc', 'id'], allowedSortFields.person).sort.asOrder()).toEqual({
      address: { id: 'DESC' },
    });
    expect(new PageRequest(undefined, undefined, undefined).size).toBe(20);
  });
  it.each([[{ id: 'ASC' }], ['id,ASC', 'password,DESC'], [], ['id,ASC', { password: 'ASC' }]].map(sort => ({ sort })))(
    'validates every sort argument, not just the first',
    ({ sort }) => {
      expect(() => new PageRequest(0, 20, sort as any, allowedSortFields.user)).toThrow('Invalid sort');
    },
  );
});
