import { flushPromises, mount } from '@vue/test-utils';
import axios from 'axios';
import Invoices from './mis-facturas.vue';

describe('Invoice filters with a keyboard', () => {
  afterEach(() => vi.restoreAllMocks());
  it('applies the same paid filter with Enter and Space', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { id: 7 } })
      .mockResolvedValueOnce({
        data: [
          { id: 1, status: 'PAID', amountDue: 100, issueDate: '2026-01-01' },
          { id: 2, status: 'PENDING', amountDue: 200, issueDate: '2026-01-02', dueDate: '2099-01-01' },
        ],
      });
    const wrapper = mount(Invoices);
    await flushPromises();
    const paid = wrapper.get('.mf-sum-card--green');
    await paid.trigger('keydown.enter');
    expect(paid.attributes('aria-pressed')).toBe('true');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    await wrapper.get('.mf-sum-card--blue').trigger('keydown.space');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    wrapper.unmount();
  });
});
