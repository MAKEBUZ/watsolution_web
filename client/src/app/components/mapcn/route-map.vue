<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { RouteMap, type MapStop } from './route-map';
const props = defineProps<{ stops: MapStop[]; line: [number, number][] }>();
const emit = defineEmits<{ error: [message: string] }>();
const host = ref<HTMLElement>();
let root: Root;
const onError = (message: string) => emit('error', message);
function render() {
  root?.render(createElement(RouteMap, { stops: props.stops, line: props.line, onError }));
}
onMounted(() => {
  root = createRoot(host.value!);
  render();
});
watch(() => [props.stops, props.line], render, { deep: true });
onBeforeUnmount(() => root?.unmount());
</script>
<template><div ref="host" class="map-host" aria-label="Mapa de viviendas y recorrido"></div></template>
<style>
.map-host {
  height: 540px;
  min-height: 300px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #ccded4;
  position: relative;
  background: #e8eeea;
}
.ws-map-cn {
  position: relative;
  height: 100%;
  width: 100%;
}
.map-tools {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  z-index: 2;
  box-shadow: 0 4px 16px #143e4320;
}
.map-tools button {
  background: white;
  border: 1px solid #d2e0d9;
  color: #176b61;
  width: 38px;
  height: 38px;
  font-size: 24px;
}
.house-marker {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 3px 10px #143e4370;
  background: #176b61;
  color: white;
  font-weight: 700;
}
.house-popup {
  padding: 16px;
  color: #143e43;
  max-width: 240px;
}
.map-host .maplibregl-popup-content {
  border-radius: 12px;
  padding: 0;
}
.map-host .maplibregl-popup-content > div {
  background: white;
  padding: 12px;
}
.map-host .maplibregl-popup-content button {
  border: 0;
  background: transparent;
  float: right;
}
.map-host .maplibregl-popup-content svg {
  width: 16px;
  height: 16px;
}
.map-host .maplibregl-ctrl-attrib {
  font-size: 10px;
}
@media (max-width: 700px) {
  .map-host {
    height: 380px;
  }
}
</style>
