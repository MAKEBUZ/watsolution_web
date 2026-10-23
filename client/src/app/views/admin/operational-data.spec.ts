import { shallowMount, flushPromises } from '@vue/test-utils';
import axios from 'axios';
import Activity from './admin-actividad.vue';
import Summary from './admin-resumen.vue';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }), useRoute: () => ({ name: 'AdminActividad' }) }));
vi.mock('@/shared/config/store/account-store', () => ({ useAccountStore: () => ({ account: null, logout: vi.fn() }) }));
vi.mock('chart.js', () => ({ Chart: Object.assign(vi.fn(), { register: vi.fn() }), registerables: [] }));
const options = { global: { stubs: { 'router-link': true, 'font-awesome-icon': true } } };

afterEach(() => vi.restoreAllMocks());
describe('Operational data provenance', () => {
  it('shows only activity returned by the API, including a zero amount and source date', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [{ id: 8, personName: 'Persona de prueba', action: 'PAGO_FACTURA', description: 'Registro de prueba', amount: 0, createdAt: '2026-01-02T12:00:00Z' }] });
    const wrapper = shallowMount(Activity, options);
    await flushPromises();
    expect(get).toHaveBeenCalledWith('api/admin/activity', { params: { limit: 50 } });
    expect(wrapper.findAll('.log-entry')).toHaveLength(1);
    expect(wrapper.text()).toContain('Persona de prueba');
    expect(wrapper.text()).toContain('Fuente: registros de la aplicación');
    expect(wrapper.find('.log-amount').text()).toContain('0');
    expect(wrapper.text()).not.toContain('Hace 5 min');
    wrapper.unmount();
  });
  it('distinguishes an empty response from a failed refresh and removes obsolete rows', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: [] });
    const wrapper = shallowMount(Activity, options);
    await flushPromises();
    expect(wrapper.text()).toContain('No hay actividad registrada');
    get.mockRejectedValueOnce(new Error('offline'));
    await wrapper.findAll('button').find(b => b.text() === 'Actualizar actividad')!.trigger('click');
    await flushPromises();
    expect(wrapper.find('[role="alert"]').text()).toContain('Sin datos verificados');
    expect(wrapper.findAll('.log-entry')).toHaveLength(0);
    expect(wrapper.text()).not.toContain('Fuente: registros');
    wrapper.unmount();
  });
  it('does not substitute a sensor percentage when APIs are unavailable', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('offline'));
    const wrapper = shallowMount(Summary, options);
    await flushPromises();
    expect(wrapper.find('[data-cy="telemetry-unavailable"]').text()).toContain('Sin datos verificados');
    for (const invented of ['85%', '99%', '75.0%', 'En vivo']) expect(wrapper.text()).not.toContain(invented);
    wrapper.unmount();
  });
});
