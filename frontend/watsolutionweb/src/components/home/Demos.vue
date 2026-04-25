<script setup lang="ts">
import { LayoutDashboard, Tablet, Smartphone } from 'lucide-vue-next'
</script>

<template>
  <section id="dashboard" class="demos">
    <div class="container">
      <div class="demos__header">
        <h2 class="demos__title">Panel de Control Multiplataforma</h2>
        <p class="demos__subtitle">Accede a toda la información crítica desde cualquier dispositivo, en cualquier lugar.</p>
      </div>

      <div class="demos__display">
        <div class="demos__device demos__device--desktop">
          <div class="demos__screen">
            <div class="demos__dashboard-mockup">
              <aside class="sidebar-mockup"></aside>
              <main class="content-mockup">
                <div class="header-mockup"></div>
                <div class="grid-mockup">
                  <div class="card-mockup"></div>
                  <div class="card-mockup"></div>
                  <div class="card-mockup"></div>
                  <div class="card-mockup"></div>
                </div>
                <div class="chart-mockup"></div>
              </main>
            </div>
          </div>
          <div class="demos__device-label"><LayoutDashboard :size="16" /> Desktop</div>
        </div>

        <div class="demos__side">
          <div class="demos__device demos__device--tablet">
            <div class="demos__screen"></div>
            <div class="demos__device-label"><Tablet :size="16" /> Tablet</div>
          </div>
          <div class="demos__device demos__device--mobile">
            <div class="demos__screen"></div>
            <div class="demos__device-label"><Smartphone :size="16" /> Mobile</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.demos {
  padding: $spacing-xl 0;
  background-color: #f8fafc;
  overflow: hidden;

  &__header {
    text-align: center;
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: 2rem;
    color: $color-text;
    margin-bottom: $spacing-sm;
    font-weight: 800;

    @include tablet {
      font-size: 2.5rem;
    }
  }

  &__subtitle {
    font-size: 1.1rem;
    color: $color-text-muted;
  }

  &__display {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;
    align-items: center;

    @include desktop {
      grid-template-columns: 2fr 1fr;
    }
  }

  &__device {
    background: #1e293b;
    border-radius: 20px;
    padding: 12px;
    box-shadow: $shadow-lg;
    position: relative;

    &--desktop {
      aspect-ratio: 16/10;
    }

    &--tablet {
      aspect-ratio: 3/4;
      width: 70%;
      margin-left: auto;
    }

    &--mobile {
      aspect-ratio: 9/16;
      width: 50%;
      margin-top: -$spacing-lg;
    }

    &-label {
      position: absolute;
      bottom: -30px;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: $color-text-muted;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
  }

  &__screen {
    background: white;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }
}

// Mockup Styles
.demos__dashboard-mockup {
  display: flex;
  height: 100%;
}

.sidebar-mockup {
  width: 60px;
  background: #f1f5f9;
  border-right: 1px solid #e2e8f0;
}

.content-mockup {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-mockup {
  height: 20px;
  background: #f1f5f9;
  border-radius: 4px;
  width: 100%;
}

.grid-mockup {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.card-mockup {
  height: 40px;
  background: #f1f5f9;
  border-radius: 4px;
}

.chart-mockup {
  flex: 1;
  background: linear-gradient(to bottom, #f1f5f9 0%, transparent 100%);
  border-radius: 4px;
}
</style>
