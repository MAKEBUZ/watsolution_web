import { matchingId } from './entity-input';
import { PersonMapper } from '../service/mapper/person.mapper';
import { UserMapper } from '../service/mapper/user.mapper';
import { NoticiaMapper } from '../service/mapper/noticia.mapper';
import { ReporteMapper } from '../service/mapper/reporte.mapper';
import { validate } from 'class-validator';
import { NoticiaDTO } from '../service/dto/noticia.dto';

describe('Record input boundaries', () => {
  it.each([0, -1, 1.1, NaN, Infinity, '1 OR 1=1'])('rejects invalid ID %s', id => {
    expect(() => matchingId({ id: id as any })).toThrow();
  });
  it('rejects conflicting route/body IDs', () => {
    expect(() => matchingId({ id: 2 }, '1')).toThrow();
    expect(matchingId({}, '1')).toBe(1);
  });
  it.each([PersonMapper, UserMapper, NoticiaMapper, ReporteMapper])('does not copy audit/unknown properties through %p', mapper => {
    const value = mapper.fromDTOtoEntity({ id: 1, createdBy: 'forged', lastModifiedBy: 'forged', unexpected: true } as any) as any;
    expect(value.createdBy).toBeUndefined();
    expect(value.lastModifiedBy).toBeUndefined();
    expect(value.unexpected).toBeUndefined();
  });
  it('keeps report relationships to an ID instead of cascading arbitrary person fields', () => {
    const value = ReporteMapper.fromDTOtoEntity({ person: { id: 5, userId: '9', fullName: 'overwritten' } } as any);
    expect(value.person).toEqual({ id: 5 });
  });
  it('validates text size and enum rather than trusting a database exception', async () => {
    const errors = await validate(Object.assign(new NoticiaDTO(), { title: 'a'.repeat(256), category: 'invalid', content: {} }));
    expect(errors.map(e => e.property)).toEqual(expect.arrayContaining(['title', 'category', 'content']));
  });
});
