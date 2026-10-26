import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import axios from 'axios';
import Home from './home.vue';
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));
describe('Public home', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });
  });
  afterEach(() => vi.restoreAllMocks());
  it('sends the primary entry action to login', async () => {
    const wrapper = shallowMount(Home, { global: { stubs: { 'font-awesome-icon': true } } });
    const entry = wrapper.findAll('button').find(button => button.text().includes('Ingresar a mi cuenta'));
    expect(entry).toBeDefined();
    await entry!.trigger('click');
    expect(push).toHaveBeenCalledWith('/login');
  });
});
