import { shallowMount } from '@vue/test-utils';
import Home from './home.vue';
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));
describe('Public home', () => {
  it('sends the primary entry action to login', async () => {
    const wrapper = shallowMount(Home, { global: { stubs: { 'font-awesome-icon': true } } });
    const entry = wrapper.findAll('button').find(button => button.text().includes('Comenzar Ahora'));
    expect(entry).toBeDefined(); await entry!.trigger('click'); expect(push).toHaveBeenCalledWith('/login');
  });
});
