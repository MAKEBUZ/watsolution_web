import { JwtStrategy } from './passport.jwt.strategy';
describe('Passport session validation', () => {
  it('returns the authorized identity once using the Nest async contract', async () => {
    const user={id:2,authorities:['ROLE_OPERATOR']};
    const strategy=new JwtStrategy({validateUser:jest.fn(async()=>user)} as any);
    expect(await strategy.validate({id:2,username:'test',sid:'session'})).toBe(user);
  });
  it('rejects a revoked or deactivated session', async () => {
    const strategy=new JwtStrategy({validateUser:jest.fn(async()=>undefined)} as any);
    await expect(strategy.validate({id:2,username:'test',sid:'session'})).rejects.toThrow('Session unavailable');
  });
});
