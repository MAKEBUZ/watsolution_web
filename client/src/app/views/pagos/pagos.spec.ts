import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import Pagos from './pagos.vue';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }) }));
const invoice = { id: 17, status: 'PENDING', amountDue: 42000, issueDate: '2026-10-01', dueDate: '2026-10-30' };
let wrapper: ReturnType<typeof mount>;
const render = () => {
  wrapper = mount(Pagos, {
    attachTo: document.body,
    global: { stubs: { 'font-awesome-icon': true, RouterLink: { template: '<a><slot /></a>' } } },
  });
  return wrapper;
};
beforeEach(() => {
  vi.resetAllMocks();
});
afterEach(() => {
  wrapper?.unmount();
  document.body.innerHTML = '';
});

async function load(invoices = [invoice]) {
  vi.mocked(axios.get)
    .mockResolvedValueOnce({ data: { id: 2 } })
    .mockResolvedValueOnce({ data: invoices });
  render();
  await flushPromises();
}

describe('Pago de facturas', () => {
  it('requires selection and confirmation before requesting the payment signature', async () => {
    await load();
    expect(wrapper.get('.continue-button').attributes('disabled')).toBeDefined();
    await wrapper.get('input[type=radio]').setValue(true);
    expect(wrapper.get('.payment-summary').text()).toContain('FAC-2026-017');
    expect(wrapper.get('.payment-summary').text()).toContain('30 de oct');
    expect(axios.get).toHaveBeenCalledTimes(2);
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { boldOrderId: 'INV-17-test', hash: 'signature', apiKey: 'test-public-key', amount: 42000 },
    });
    await wrapper.get('.continue-button').trigger('click');
    await flushPromises();
    const button = wrapper.get('#bold-payment-container script');
    expect(button.attributes('data-amount')).toBe('42000');
    expect(button.attributes('data-redirection-url')).toContain('/invoice/17/payment-result');
  });
  it('excludes paid and cancelled invoices', async () => {
    await load([invoice, { ...invoice, id: 18, status: 'PAID' }, { ...invoice, id: 19, status: 'CANCELLED' }]);
    expect(wrapper.findAll('input[type=radio]')).toHaveLength(1);
  });
  it('shows a retryable error rather than an empty balance when loading fails', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('offline'));
    render();
    await flushPromises();
    expect(wrapper.get('[role=alert]').text()).toContain('Reintentar consulta');
    expect(wrapper.text()).not.toContain('Estás al día');
  });
  it('shows gateway failures without reporting a successful payment', async () => {
    await load();
    await wrapper.get('input[type=radio]').setValue(true);
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('not configured'));
    await wrapper.get('.continue-button').trigger('click');
    await flushPromises();
    expect(wrapper.get('[role=alert]').text()).toContain('Reintentar conexión');
    expect(wrapper.find('#bold-payment-container').exists()).toBe(false);
  });
  it('ignores an outstanding gateway response after returning to invoice selection', async () => {
    await load();
    await wrapper.get('input[type=radio]').setValue(true);
    let resolve!: (value: unknown) => void;
    vi.mocked(axios.get).mockReturnValueOnce(
      new Promise(r => {
        resolve = r;
      }),
    );
    await wrapper.get('.continue-button').trigger('click');
    await wrapper.get('.text-button').trigger('click');
    resolve({ data: { boldOrderId: 'INV-17-test', hash: 'signature', apiKey: 'test-public-key', amount: 42000 } });
    await flushPromises();
    expect(document.getElementById('bold-sdk')).toBeNull();
    expect(wrapper.find('input[type=radio]').exists()).toBe(true);
  });
});
