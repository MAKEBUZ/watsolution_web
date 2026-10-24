import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import axios from 'axios';
import Billing from './admin-facturacion.vue';
import Users from './admin-usuarios.vue';
import { createSessionGuard } from '@/router/session-guard';
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }), useRoute: () => ({ name: 'AdminFacturacion' }) }));
const options = { global: { stubs: { 'router-link': true, 'font-awesome-icon': true } } };
beforeEach(() => setActivePinia(createPinia()));
afterEach(() => vi.restoreAllMocks());
describe('Administrator workflows', () => {
  it('allows an admin-only account to enter a page requiring the user role', async () => {
    const check = vi.fn(async () => false);
    const guard = createSessionGuard(
      { authenticated: true, account: { authorities: ['ROLE_ADMIN'] } } as any,
      { hasAnyAuthorityAndCheckAuth: check } as any,
    );
    expect(await guard({ path: '/portal', fullPath: '/portal', meta: { authorities: ['ROLE_USER'] } } as any)).toBe(true);
  });
  it('queries the next page of users instead of restricting searches to the first 200', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [{ id: 1, fullName: 'Person' }], headers: { 'x-total-count': '250' } });
    const wrapper = mount(Users, options);
    await flushPromises();
    await wrapper
      .findAll('button')
      .find(b => b.text() === 'Siguiente')!
      .trigger('click');
    await flushPromises();
    expect(get).toHaveBeenLastCalledWith('api/people', { params: expect.objectContaining({ page: 1, size: 12 }) });
    expect(wrapper.text()).toContain('250');
    wrapper.unmount();
  });
  it('uses the last reading as baseline, calculates the difference, and reuses the command on an uncertain retry', async () => {
    const get = vi.spyOn(axios, 'get').mockImplementation(
      async (url: any) =>
        ({
          data:
            url === 'api/mobile/tariff'
              ? { rate: 100, fixedCharge: 500 }
              : String(url).includes('meters')
                ? [{ id: 9, waterMeasure: 100, readingDate: '2026-01-01' }]
                : [{ id: 201, fullName: 'Beyond first page', documentNumber: '201' }],
        }) as any,
    );
    const post = vi
      .spyOn(axios, 'post')
      .mockRejectedValueOnce(new Error('connection lost'))
      .mockResolvedValueOnce({ data: { invoiceId: 88, amountDue: 1500 } });
    const wrapper = mount(Billing, options);
    await flushPromises();
    await wrapper.get('input[type="text"]').setValue('201');
    await wrapper.get('.btn-search').trigger('click');
    await flushPromises();
    expect(get).toHaveBeenCalledWith('api/people', { params: expect.objectContaining({ search: '201' }) });
    await wrapper.get('.search-dropdown-item').trigger('click');
    await flushPromises();
    const reading = wrapper
      .findAll('input[type="number"]')
      .find(i => !i.attributes('readonly') && i.attributes('step') === '0.01' && i.attributes('max') === undefined)!;
    await reading.setValue('110');
    const generate = () => wrapper.findAll('button').find(b => b.text().includes('Generar Factura'))!;
    await generate().trigger('click');
    await flushPromises();
    expect(post.mock.calls[0][0]).toBe('api/mobile/capture-billing');
    expect(post.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        personId: 201,
        previousMeterId: 9,
        waterMeasure: 110,
        billing: { rate: 100, fixedCharge: 500, subsidy: 0, surcharges: 0 },
      }),
    );
    await generate().trigger('click');
    await flushPromises();
    expect(post.mock.calls[1][1]).toEqual(post.mock.calls[0][1]);
    expect(wrapper.text()).toContain('FAC-88');
    expect(wrapper.text()).toContain('Descargar PDF');
    wrapper.unmount();
  });
});
