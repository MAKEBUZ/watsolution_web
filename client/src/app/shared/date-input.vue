<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ modelValue?: string | Date | null; id: string; name: string; locale?: string; required?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const dayString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const value = computed(() => (props.modelValue instanceof Date ? dayString(props.modelValue) : (props.modelValue || '').slice(0, 10)));
const update = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value);
</script>

<template>
  <div class="input-group mb-3">
    <input
      :id="id"
      :name="name"
      :data-cy="name"
      class="form-control"
      type="date"
      :lang="locale || 'es'"
      :value="value"
      :required="required"
      @input="update"
    />
    <button type="button" class="btn btn-outline-secondary" @click="emit('update:modelValue', dayString(new Date()))">Hoy</button>
    <button type="button" class="btn btn-outline-secondary" @click="emit('update:modelValue', '')">Limpiar</button>
  </div>
</template>
