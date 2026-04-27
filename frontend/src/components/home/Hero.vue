<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section id="inicio" class="hero">
    <div class="hero__waves">
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
      <defs>
      <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
      </defs>
      <g class="parallax">
      <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(0,119,190,0.7" />
      <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(0,206,209,0.5)" />
      <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(64,224,208,0.3)" />
      <use xlink:href="#gentle-wave" x="48" y="7" fill="#f0faff" />
      </g>
      </svg>
    </div>

    <div class="container hero__content">
      <div class="hero__text">
        <h1 class="hero__title">Gestión Inteligente de <span>Acueductos</span></h1>
        <p class="hero__description">
          Optimiza la distribución, monitorea en tiempo real y garantiza la sostenibilidad hídrica con la plataforma PWA líder en el sector.
        </p>
        <div class="hero__actions">
          <button class="btn btn--primary">Comenzar Ahora <ArrowRight :size="18" /></button>
          <button class="btn btn--outline">Ver Dashboard</button>
        </div>
      </div>
      <div class="hero__image">
        <div class="hero__card">
          <div class="hero__card-header">
            <div class="hero__card-dot"></div>
            <div class="hero__card-dot"></div>
            <div class="hero__card-dot"></div>
          </div>
          <div class="hero__card-body">
            <!-- Mockup of a digital meter/graph -->
            <div class="mockup-graph">
              <div class="mockup-bar" style="height: 60%"></div>
              <div class="mockup-bar" style="height: 80%"></div>
              <div class="mockup-bar" style="height: 45%"></div>
              <div class="mockup-bar" style="height: 90%"></div>
              <div class="mockup-bar" style="height: 70%"></div>
            </div>
            <div class="mockup-stats">
              <div class="mockup-stat">
                <span class="mockup-label">Flujo Actual</span>
                <span class="mockup-value">1,240 L/s</span>
              </div>
              <div class="mockup-stat">
                <span class="mockup-label">Presión</span>
                <span class="mockup-value">4.2 Bar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 80px;
  overflow: hidden;
  background: linear-gradient(135deg, $color-white 0%, #e0f2fe 100%);

  &__waves {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 15vh;
    min-height: 100px;
    max-height: 150px;
    z-index: 1;
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;
    align-items: center;
    position: relative;
    z-index: 2;

    @include desktop {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__title {
    font-size: 2.5rem;
    line-height: 1.2;
    margin-bottom: $spacing-md;
    font-weight: 800;
    color: $color-text;

    span {
      color: $color-primary;
    }

    @include tablet {
      font-size: 3.5rem;
    }
  }

  &__description {
    font-size: 1.1rem;
    color: $color-text-muted;
    margin-bottom: $spacing-lg;
    max-width: 500px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;

    .btn {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
    }
  }

  &__image {
    display: flex;
    justify-content: center;
    perspective: 1000px;
  }

  &__card {
    background: white;
    border-radius: 16px;
    box-shadow: $shadow-lg;
    width: 100%;
    max-width: 400px;
    padding: $spacing-md;
    transform: rotateY(-10deg) rotateX(5deg);
    transition: transform 0.5s ease;

    &:hover {
      transform: rotateY(0deg) rotateX(0deg);
    }

    &-header {
      display: flex;
      gap: 6px;
      margin-bottom: $spacing-md;
    }

    &-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e2e8f0;

      &:nth-child(1) { background: #ff5f56; }
      &:nth-child(2) { background: #ffbd2e; }
      &:nth-child(3) { background: #27c93f; }
    }
  }
}

.waves {
  position: relative;
  width: 100%;
  height: 100%;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
}
.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% { transform: translate3d(-90px,0,0); }
  100% { transform: translate3d(85px,0,0); }
}

.mockup-graph {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 150px;
  margin-bottom: $spacing-md;
  padding: $spacing-sm;
  background: #f8fafc;
  border-radius: 8px;
}

.mockup-bar {
  flex: 1;
  background: $color-primary;
  border-radius: 4px 4px 0 0;
  transition: height 1s ease;
}

.mockup-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
}

.mockup-stat {
  display: flex;
  flex-direction: column;
}

.mockup-label {
  font-size: 0.8rem;
  color: $color-text-muted;
}

.mockup-value {
  font-weight: 700;
  color: $color-text;
  font-size: 1.2rem;
}
</style>
