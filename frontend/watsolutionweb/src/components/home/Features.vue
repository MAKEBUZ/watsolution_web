<script setup lang="ts">
import { Network, Activity, FileBarChart, Bell } from 'lucide-vue-next'

const features = [
  {
    title: 'Gestión de Redes',
    description: 'Control total sobre la infraestructura de tuberías y nodos de distribución.',
    icon: Network,
    color: '#0077be'
  },
  {
    title: 'Monitoreo en Tiempo Real',
    description: 'Visualiza flujos, presiones y niveles de tanques al instante.',
    icon: Activity,
    color: '#00ced1'
  },
  {
    title: 'Reportes Automáticos',
    description: 'Genera informes de consumo y eficiencia hídrica con un solo clic.',
    icon: FileBarChart,
    color: '#40e0d0'
  },
  {
    title: 'Alertas de Mantenimiento',
    description: 'Sistema predictivo de fallas para prevenir fugas y roturas.',
    icon: Bell,
    color: '#3498db'
  }
]
</script>

<template>
  <section id="caracteristicas" class="features">
    <div class="container">
      <div class="features__header">
        <h2 class="features__title">Soluciones Avanzadas para el <span>Agua</span></h2>
        <p class="features__subtitle">Tecnología diseñada específicamente para los retos de la gestión hídrica moderna.</p>
      </div>

      <div class="features__grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-card__icon" :style="{ backgroundColor: feature.color + '20', color: feature.color }">
            <component :is="feature.icon" :size="32" />
          </div>
          <h3 class="feature-card__title">{{ feature.title }}</h3>
          <p class="feature-card__description">{{ feature.description }}</p>
          <a href="#" class="feature-card__link">Saber más →</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.features {
  padding: $spacing-xl 0;
  background-color: $color-white;

  &__header {
    text-align: center;
    margin-bottom: $spacing-xl;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  &__title {
    font-size: 2rem;
    color: $color-text;
    margin-bottom: $spacing-sm;
    font-weight: 800;

    span {
      color: $color-primary;
    }

    @include tablet {
      font-size: 2.5rem;
    }
  }

  &__subtitle {
    font-size: 1.1rem;
    color: $color-text-muted;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-md;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @include desktop {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

.feature-card {
  background: $color-white;
  padding: $spacing-md;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  &:hover {
    transform: translateY(-10px);
    box-shadow: $shadow-lg;
    border-color: $color-primary;
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-xs;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: $color-text;
  }

  &__description {
    font-size: 0.95rem;
    color: $color-text-muted;
    line-height: 1.6;
    flex: 1;
  }

  &__link {
    font-size: 0.9rem;
    font-weight: 600;
    color: $color-primary;
    margin-top: $spacing-sm;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
