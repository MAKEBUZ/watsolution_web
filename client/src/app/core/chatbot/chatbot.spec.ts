import { mount, flushPromises } from '@vue/test-utils';
import { computed, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import axios from 'axios';
import { useAccountStore } from '@/shared/config/store/account-store';
import ChatBot from './chatbot.vue';

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/portal' }) }));

describe('Chat session isolation (T-007 / WS-006)', () => {
  let store: ReturnType<typeof useAccountStore>;
  let wrapper: ReturnType<typeof mount>;
  let post: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAccountStore();
    store.setAuthentication({ id: 1, login: 'admin', authorities: ['ROLE_ADMIN'] });
    post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { reply: 'Respuesta privada A' } });
    wrapper = mount(ChatBot, { global: { provide: { authenticated: computed(() => store.authenticated) } } });
  });
  afterEach(() => { wrapper.unmount(); vi.restoreAllMocks(); });

  const openChat = () => wrapper.get('.cb-trigger').trigger('click');
  const send = async (message: string) => {
    await wrapper.get('textarea').setValue(message);
    await wrapper.get('.cb-send').trigger('click');
    await flushPromises();
  };
  const changeAccount = async () => {
    store.setAuthentication({ id: 2, login: 'user', authorities: ['ROLE_USER'] });
    await nextTick();
  };

  it('clears messages, draft and panel on account change', async () => {
    await openChat(); await send('Dato privado A');
    await wrapper.get('textarea').setValue('Borrador privado');
    await changeAccount();
    expect(wrapper.find('.cb-panel').exists()).toBe(false);
    await openChat();
    expect(wrapper.text()).not.toContain('privad');
    expect(wrapper.text()).not.toContain('administrador');
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('');
  });

  it('clears the chat even when logout and same-account login happen in the same tick', async () => {
    await openChat(); await send('Dato privado A');
    store.logout();
    store.setAuthentication({ id: 1, login: 'admin', authorities: ['ROLE_ADMIN'] });
    await nextTick();
    expect(wrapper.find('.cb-panel').exists()).toBe(false);
    await openChat();
    expect(wrapper.text()).not.toContain('Dato privado A');
  });

  it.each(['resolve', 'reject'])('discards late %s from the previous account without unlocking a new request', async outcome => {
    let finishOld: (value?: any) => void;
    let finishNew: (value: any) => void;
    post.mockImplementationOnce(() => new Promise((resolve, reject) => { finishOld = outcome === 'resolve' ? resolve : reject; }));
    await openChat(); await send('Dato privado A');
    const oldSignal = post.mock.calls[0][2]?.signal;
    await changeAccount(); await openChat();
    post.mockImplementationOnce(() => new Promise(resolve => { finishNew = resolve; }));
    await send('Consulta B');
    finishOld!({ data: { reply: 'Respuesta privada A' } });
    await flushPromises();
    expect(oldSignal?.aborted).toBe(true);
    expect(wrapper.text()).not.toContain('privad');
    expect(wrapper.text()).not.toContain('Ocurrió un error');
    expect(wrapper.find('.cb-typing').exists()).toBe(true);
    finishNew!({ data: { reply: 'Respuesta B' } });
    await flushPromises();
    expect(wrapper.text()).toContain('Respuesta B');
    expect(wrapper.find('.cb-typing').exists()).toBe(false);
    expect(post.mock.calls[1][0]).toBe('api/ai/chat');
  });

  it('clears data when permissions change for the same account', async () => {
    await openChat(); await send('Dato privado A');
    store.userIdentity.authorities = ['ROLE_USER'];
    await nextTick();
    expect(wrapper.find('.cb-panel').exists()).toBe(false);
  });

  it('aborts pending work when unmounted', async () => {
    post.mockImplementationOnce(() => new Promise(() => {}));
    await openChat(); await send('Consulta A');
    const signal = post.mock.calls[0][2]?.signal;
    wrapper.unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('preserves the conversation on a refresh of the same identity and permissions', async () => {
    await openChat(); await send('Consulta A');
    store.setAuthentication({ id: 1, login: 'admin', authorities: ['ROLE_ADMIN'] });
    await nextTick();
    expect(wrapper.text()).toContain('Consulta A');
    expect(wrapper.text()).toContain('Respuesta privada A');
  });
});
