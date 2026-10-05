import { calculateBill } from './billing.service';
describe('Canonical billing arithmetic', () => {
  it('calculates consumption, fixed charge and subsidy in integer cents', () => expect(calculateBill(5, 2500, 5000, 0.15, 0)).toBe(14875));
  it('rounds fractional cents explicitly', () => expect(calculateBill(0.01, 1.55, 0, 0, 0)).toBe(0.02));
  it('rejects negative consumption rather than substituting zero', () => expect(() => calculateBill(-1, 2500, 5000, 0, 0)).toThrow());
  it('rejects an invalid subsidy', () => expect(() => calculateBill(1, 1, 1, 1.5, 0)).toThrow());
  it('rejects amounts beyond the database precision', () => expect(() => calculateBill(99999999.99, 99999999.99, 0, 0, 0)).toThrow());
});
