<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import WaterNetwork from './water-network.vue';
const section = ref<HTMLElement | null>(null);
const progress = ref(0);
const staticMode = ref(false);
let frame = 0;
let media: MediaQueryList | undefined;
const active = computed(() => Math.min(3, Math.floor(progress.value * 4)));
const steps = [
  {
    number: '01',
    label: 'EL ORIGEN',
    title: 'Abre el grifo.',
    emphasis: 'Empieza el viaje.',
    text: 'Una gota pone todo en movimiento. Sigue su camino al bajar por la página.',
  },
  {
    number: '02',
    label: 'LA CONEXIÓN',
    title: 'Bajo nuestros pies,',
    emphasis: 'una red nos une.',
    text: 'El agua avanza por las tuberías. Detrás de cada conexión hay un servicio que merece cuidado.',
  },
  {
    number: '03',
    label: 'EL DESTINO',
    title: 'El agua llega.',
    emphasis: 'La vida continúa.',
    text: 'A la cocina, al jardín, a cada hogar. Conocer tu consumo te ayuda a cuidar lo que compartimos.',
  },
  {
    number: '04',
    label: 'EL CUIDADO',
    title: 'Que desborden',
    emphasis: 'las buenas ideas.',
    text: 'El depósito de esta historia se llena. En casa, evita el desperdicio: empieza por un hábito sencillo.',
  },
];
const tips = [
  { title: 'Cierra mientras no la usas.', text: 'Al cepillarte o enjabonarte las manos, deja descansar el grifo.' },
  { title: 'Escucha las pequeñas fugas.', text: 'Revisa grifos y conexiones. Un goteo también merece atención.' },
  { title: 'Dale otra oportunidad.', text: 'Reutiliza agua adecuada para regar y aprovecha cargas completas al lavar.' },
];
function measure() {
  frame = 0;
  if (!section.value || staticMode.value) return;
  const box = section.value.getBoundingClientRect();
  progress.value = Math.max(0, Math.min(1, (80 - box.top) / Math.max(1, box.height - innerHeight)));
}
function schedule() {
  if (!frame && !staticMode.value) frame = requestAnimationFrame(measure);
}
function preference() {
  staticMode.value = !!media?.matches;
  progress.value = staticMode.value ? 1 : 0;
  schedule();
}
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 650px)');
  preference();
  media.addEventListener('change', preference);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  media?.removeEventListener('change', preference);
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
});
</script>

<template>
  <section id="water-story" class="water-journey" :class="{ 'is-static': staticMode }" aria-labelledby="journey-title">
    <header class="journey-heading">
      <p class="ws-eyebrow">UNA HISTORIA QUE FLUYE CONTIGO</p>
      <h2 id="journey-title">De una gota.<br /><em>A todo un hogar.</em></h2>
      <p>Desplázate. El agua encuentra su camino.</p>
      <span aria-hidden="true" class="journey-arrow">↓</span>
    </header>
    <div ref="section" class="journey-scroll">
      <div class="journey-stage" :data-phase="active" :style="{ '--journey-progress': progress }">
        <div class="journey-art">
          <div class="journey-art__top">
            <span>WAT / EL RECORRIDO DEL AGUA</span><span aria-hidden="true">{{ steps[active].number }} — 04</span>
          </div>
          <WaterNetwork :progress="progress" />
          <div class="journey-meter">
            <span>DESPLAZAMIENTO</span>
            <div><i :style="{ transform: `scaleX(${progress})` }" /></div>
          </div>
          <small>Ilustración narrativa. No representa mediciones reales.</small>
        </div>
        <div class="journey-copy">
          <ol class="journey-chapters" aria-label="Etapas del recorrido">
            <li v-for="(step, i) in steps" :key="step.number" :class="{ 'is-current': active === i, 'is-past': active > i }">
              <span>{{ step.number }}</span
              ><span class="chapter-label">{{ step.label }}</span>
            </li>
          </ol>
          <div class="journey-phases">
            <article v-for="(step, i) in steps" :key="step.number" class="journey-phase" :class="{ 'is-active': active === i }">
              <span class="journey-phase__label">{{ step.label }}</span>
              <h3>
                {{ step.title }}<br /><em>{{ step.emphasis }}</em>
              </h3>
              <p>{{ step.text }}</p>
            </article>
          </div>
          <div class="journey-tips" :class="{ 'is-revealed': progress > 0.88 }" aria-label="Consejos para cuidar el agua">
            <p class="journey-tips__label">TRES HÁBITOS PARA LLEVAR A CASA</p>
            <div v-for="(tip, i) in tips" :key="tip.title" class="journey-tip">
              <span aria-hidden="true">0{{ i + 1 }}</span>
              <div>
                <h4>{{ tip.title }}</h4>
                <p>{{ tip.text }}</p>
              </div>
            </div>
          </div>
          <p class="journey-scroll-hint" aria-hidden="true">
            {{ progress > 0.88 ? 'El recorrido termina. El cuidado sigue.' : 'Sigue bajando para descubrir el siguiente paso.' }}
            <span>↓</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.water-journey {
  scroll-margin-top: 80px;
  background: #eeeedd;
  color: #163e43;
  padding: 88px max(24px, calc((100vw - 1280px) / 2)) 70px;
  position: relative;
  border-top: 1px solid #d8dfcf;
}
.journey-heading {
  position: relative;
  max-width: 1000px;
  margin-bottom: 56px;
}
.journey-heading h2 {
  font-size: clamp(48px, 7vw, 88px);
  line-height: 0.98;
  letter-spacing: -0.065em;
  margin: 22px 0;
}
.journey-heading em,
.journey-phase em {
  font-family: Georgia, serif;
  font-weight: 400;
  color: #087f83;
}
.journey-heading > p:last-of-type {
  color: #506c63;
  font-size: 17px;
}
.journey-arrow {
  position: absolute;
  right: 0;
  bottom: 0;
  font:
    70px Georgia,
    serif;
  color: #759c88;
}
.journey-scroll {
  height: 320svh;
  position: relative;
}
.journey-stage {
  position: sticky;
  top: 80px;
  height: calc(100svh - 110px);
  min-height: 580px;
  max-height: 900px;
  display: grid;
  grid-template-columns: 1.12fr 1fr;
  gap: clamp(28px, 5vw, 76px);
  align-items: center;
}
.journey-art {
  height: 100%;
  max-height: 790px;
  min-width: 0;
  background: linear-gradient(150deg, #193f43, #235b57 60%, #1a4445);
  border-radius: 180px 180px 24px 24px;
  padding: 40px 25px 22px;
  color: #eff1dc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 22px 30px -25px #1b514a66;
  position: relative;
  border: 1px solid #527d70;
}
.journey-art .water-network {
  max-height: calc(100% - 95px);
  flex: 1;
  min-height: 0;
}
.journey-art__top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 9px;
  letter-spacing: 0.15em;
  margin: 10px 28px 20px;
  color: #c6ddca;
}
.journey-art small {
  font-size: 10px;
  color: #c6ddca;
  text-align: center;
  margin-top: 12px;
}
.journey-meter {
  display: flex;
  gap: 15px;
  align-items: center;
  margin: 15px 25px 0;
  font-size: 9px;
  letter-spacing: 0.14em;
  color: #c6ddca;
}
.journey-meter > div {
  height: 3px;
  background: #507d74;
  flex: 1;
  overflow: hidden;
}
.journey-meter i {
  display: block;
  background: #b9ead0;
  height: 100%;
  transform-origin: left;
}
.journey-copy {
  min-width: 0;
}
.journey-chapters {
  display: flex;
  list-style: none;
  gap: 16px;
  margin: 0 0 40px;
  padding: 0;
}
.journey-chapters li {
  border-top: 2px solid #c8d3be;
  flex: 1;
  padding-top: 10px;
  color: #60796e;
  font-size: 12px;
}
.journey-chapters .is-current,
.journey-chapters .is-past {
  border-color: #087f83;
  color: #087f83;
}
.journey-chapters .is-current > span:first-child {
  font-weight: 800;
}
.chapter-label {
  display: block;
  font-size: 8px;
  letter-spacing: 0.09em;
  margin-top: 7px;
}
.journey-phase:not(.is-active) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.journey-phase__label {
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.18em;
  color: #4d7669;
}
.journey-phase h3 {
  color: #163e43;
  font-size: clamp(30px, 3.6vw, 48px);
  letter-spacing: -0.045em;
  line-height: 1.08;
  margin: 17px 0;
}
.journey-phase > p {
  font-size: 16px;
  line-height: 1.65;
  color: #4c675e;
  max-width: 430px;
  margin: 0;
}
.journey-tips {
  margin-top: 22px;
  display: grid;
  grid-template-rows: 0fr;
  height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.4s,
    transform 0.4s;
}
.journey-tips.is-revealed {
  visibility: visible;
  height: auto;
  opacity: 1;
  transform: none;
  display: block;
}
.journey-tips__label {
  font-size: 9px;
  letter-spacing: 0.13em;
  color: #527365;
  font-weight: 700;
}
.journey-tip {
  display: flex;
  gap: 14px;
  border-top: 1px solid #bdcdb9;
  padding: 13px 0;
}
.journey-tip > span {
  font:
    italic 21px Georgia,
    serif;
  color: #087f83;
}
.journey-tip h4 {
  font-size: 15px;
  font-weight: 750;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
  color: #163e43;
}
.journey-tip p {
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  color: #48675c;
}
.journey-scroll-hint {
  font-size: 11px;
  color: #526d62;
  margin: 30px 0 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.journey-scroll-hint span {
  font-size: 24px;
  line-height: 1;
}
@media (max-width: 800px) {
  .water-journey {
    padding: 50px 18px 35px;
  }
  .journey-heading {
    margin-bottom: 30px;
  }
  .journey-heading h2 {
    font-size: 54px;
  }
  .journey-arrow {
    font-size: 50px;
  }
  .journey-scroll {
    height: 340svh;
  }
  .journey-stage {
    top: 70px;
    height: calc(100svh - 90px);
    min-height: 560px;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(230px, 1fr) auto;
    gap: 20px;
    align-items: stretch;
  }
  .journey-art {
    border-radius: 90px 90px 18px 18px;
    padding: 12px 20px;
    min-height: 0;
  }
  .journey-art .water-network {
    max-height: 100%;
    width: 100%;
    flex: 1;
  }
  .journey-art__top,
  .journey-meter {
    display: none;
  }
  .journey-art small {
    font-size: 8px;
    margin-top: 0;
  }
  .journey-chapters {
    margin-bottom: 14px;
    gap: 10px;
  }
  .journey-chapters li {
    padding-top: 6px;
    font-size: 10px;
  }
  .chapter-label {
    display: none;
  }
  .journey-phase__label {
    display: none;
  }
  .journey-phase h3 {
    font-size: 29px;
    margin: 0 0 9px;
  }
  .journey-phase > p {
    font-size: 13px;
    line-height: 1.5;
    max-width: none;
  }
  .journey-scroll-hint {
    margin: 12px 0 0;
    font-size: 10px;
  }
  .journey-tips {
    margin-top: 12px;
  }
  .journey-tip {
    padding: 8px 0;
    gap: 10px;
  }
  .journey-tip h4 {
    font-size: 14px;
  }
  .journey-tip p {
    font-size: 13px;
  }
  .journey-tips__label {
    font-size: 8px;
    margin-bottom: 5px;
  }
  .journey-stage[data-phase='3'] .journey-phase > p {
    display: none;
  }
}
.is-static .journey-scroll {
  height: auto;
}
.is-static .journey-stage {
  position: relative;
  top: 0;
  height: auto;
  max-height: none;
  min-height: 0;
  align-items: start;
}
.is-static .journey-art {
  height: auto;
  min-height: 350px;
}
.is-static .journey-art .water-network {
  max-height: none;
}
.is-static .journey-phase {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip-path: none;
  white-space: normal;
  margin-bottom: 30px;
}
.is-static .journey-phase > p {
  display: block;
}
.is-static .journey-tips {
  display: block;
  visibility: visible;
  height: auto;
  opacity: 1;
  transform: none;
  transition: none;
}
.is-static .journey-chapters,
.is-static .journey-scroll-hint {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .journey-tips {
    transition: none;
  }
}
</style>
