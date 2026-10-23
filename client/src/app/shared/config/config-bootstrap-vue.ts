import type { App } from 'vue';
import {
  BAlert,
  BBadge,
  BButton,
  BDropdownDivider,
  BDropdownItem,
  BForm,
  BFormCheckbox,
  BFormGroup,
  BFormInput,
  BLink,
  BModal,
  BNavItemDropdown,
  BPagination,
  createBootstrap,
} from 'bootstrap-vue-next';
import DateInput from '../date-input.vue';

// Register only the Vue 3 components used by the existing screens.
export function initBootstrapVue(app: App) {
  app.use(createBootstrap());
  const components = {
    BAlert,
    BBadge,
    BButton,
    BDropdownDivider,
    BDropdownItem,
    BForm,
    BFormCheckbox,
    BFormGroup,
    BFormInput,
    BLink,
    BModal,
    BNavItemDropdown,
    BPagination,
  };
  for (const [name, component] of Object.entries(components)) app.component(name, component);
  app.component('ws-date-input', DateInput);
}
