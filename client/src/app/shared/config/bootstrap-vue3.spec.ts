import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { BApp, BModal, BPagination, BFormInput, BFormCheckbox } from 'bootstrap-vue-next';
import { initBootstrapVue } from './config-bootstrap-vue';
import { useAlertService } from '../alert/alert.service';
import DateInput from '../date-input.vue';

describe('Vue 3 controls without legacy compatibility', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });
  const plugin = { install: initBootstrapVue };

  it('keeps date selection, manual typing, today and reset in YYYY-MM-DD without timezone conversion', async () => {
    const wrapper = mount(DateInput, { props: { id: 'reading-date', name: 'readingDate', modelValue: '2026-10-23', required: true } });
    expect(wrapper.get('input').element.value).toBe('2026-10-23');
    await wrapper.get('input').setValue('2026-10-24');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-10-24']);
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['']);
    wrapper.unmount();
  });

  it('updates form inputs, checkboxes and pagination using Vue 3 v-model', async () => {
    const input = mount(BFormInput, { props: { modelValue: 'Anterior' } });
    await input.get('input').setValue('Nuevo');
    expect(input.emitted('update:modelValue')?.at(-1)).toEqual(['Nuevo']);
    const checkbox = mount(BFormCheckbox, { props: { modelValue: false } });
    await checkbox.get('input').setValue(true);
    expect(checkbox.emitted('update:modelValue')?.at(-1)).toEqual([true]);
    const pages = mount(BPagination, { props: { totalRows: 45, perPage: 20, modelValue: 1 } });
    await pages.get('[aria-label="Go to page 2"]').trigger('click');
    expect(pages.emitted('update:modelValue')?.at(-1)).toEqual([2]);
    input.unmount();
    checkbox.unmount();
    pages.unmount();
  });

  it('opens and cancels a real confirmation modal without confirming deletion', async () => {
    const removed = vi.fn();
    const inner = defineComponent({
      setup() {
        const modal = ref<any>();
        return () =>
          h('div', [
            h('button', { id: 'open', onClick: () => modal.value.show() }, 'Eliminar'),
            h(
              BModal,
              { ref: modal, id: 'confirmation', title: 'Confirmar eliminación', onOk: removed, noFade: true },
              {
                default: () => '¿Eliminar este registro?',
                footer: () => h('button', { id: 'cancel', onClick: () => modal.value.hide() }, 'Cancelar'),
              },
            ),
          ]);
      },
    });
    const wrapper = mount(BApp, { slots: { default: () => h(inner) }, attachTo: document.body, global: { plugins: [plugin] } });
    await wrapper.get('#open').trigger('click');
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Confirmar eliminación');
    (document.querySelector('#cancel') as HTMLButtonElement).click();
    await flushPromises();
    expect(removed).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('shows translated alert messages as text, not executable HTML', async () => {
    const inner = defineComponent({
      setup() {
        const alerts = useAlertService();
        return () => h('button', { id: 'toast', onClick: () => alerts.showSuccess('<img src=x onerror=alert(1)>') }, 'Guardar');
      },
    });
    const wrapper = mount(BApp, { slots: { default: () => h(inner) }, attachTo: document.body, global: { plugins: [plugin] } });
    await wrapper.get('#toast').trigger('click');
    await nextTick();
    await flushPromises();
    expect(document.body.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(document.querySelector('.toast img')).toBeNull();
    wrapper.unmount();
  });
});
