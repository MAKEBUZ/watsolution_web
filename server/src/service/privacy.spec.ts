import { AiService } from './ai.service';
import { assertPassword } from '../security/password-policy';
describe('Personal-data minimization', () => {
  it('queries billing using authenticated account id and returns a local summary', async () => {
    const invoices={find:jest.fn(async()=>[])};
    const service=new AiService(invoices as any,{} as any,{} as any);
    expect(await service.chat(2,'private synthetic question')).toEqual({reply:'No hay facturas disponibles para esta cuenta.'});
    expect(invoices.find).toHaveBeenCalledWith(expect.objectContaining({where:{person:{userId:'2'}}}));
  });
  it.each(['short','            ','é'.repeat(40)])('rejects an unsafe or truncated password', value=>expect(()=>assertPassword(value)).toThrow());
  it('accepts a long passphrase',()=>expect(()=>assertPassword('Una frase unica de prueba 42')).not.toThrow());
});
