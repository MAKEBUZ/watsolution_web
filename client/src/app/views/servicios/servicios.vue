<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLogin = () => {
  router.push('/login');
};

const services = [
  {
    title: 'Gestión de Redes',
    description:
      'Diseño, monitoreo y optimización de infraestructuras de distribución de agua potable con mapas interactivos y trazado de tuberías.',
    icon: 'network-wired',
    color: '#0077be',
  },
  {
    title: 'Monitoreo IoT',
    description:
      'Sensores inteligentes en tiempo real para medir presión, caudal, nivel de tanques y calidad del agua desde cualquier dispositivo.',
    icon: 'microchip',
    color: '#00ced1',
  },
  {
    title: 'Facturación Automatizada',
    description: 'Generación automática de facturas basada en lecturas remotas, con múltiples métodos de pago y historial completo.',
    icon: 'file-invoice-dollar',
    color: '#40e0d0',
  },
  {
    title: 'Mantenimiento Predictivo',
    description: 'Algoritmos de inteligencia artificial que anticipan fallas, fugas y obstrucciones antes de que afecten el servicio.',
    icon: 'tools',
    color: '#3498db',
  },
  {
    title: 'Atención al Usuario',
    description: 'Portal de clientes, chatbot integrado y sistema de tickets para resolver dudas, reclamos y solicitudes de servicio.',
    icon: 'headset',
    color: '#0077be',
  },
  {
    title: 'Reportes Avanzados',
    description: 'Dashboards ejecutivos con métricas clave, exportación a PDF/Excel y cumplimiento normativo automatizado.',
    icon: 'chart-pie',
    color: '#00ced1',
  },
];

const steps = [
  {
    number: '01',
    title: 'Diagnóstico',
    description: 'Analizamos tu infraestructura actual, identificamos cuellos de botella y definimos objetivos de mejora.',
  },
  {
    number: '02',
    title: 'Implementación',
    description: 'Desplegamos la plataforma, configuramos sensores IoT y migramos tus datos históricos de forma segura.',
  },
  {
    number: '03',
    title: 'Capacitación',
    description: 'Formamos a tu equipo operativo y administrativo con sesiones prácticas y documentación personalizada.',
  },
  {
    number: '04',
    title: 'Soporte Continuo',
    description: 'Acompañamiento técnico 24/7, actualizaciones constantes y evolución de la plataforma según tus necesidades.',
  },
];

const benefits = [
  {
    title: 'Reduce pérdidas',
    value: '-25%',
    description: 'Disminución promedio de pérdidas técnicas en los primeros 12 meses.',
    icon: 'arrow-down',
    color: '#10b981',
  },
  {
    title: 'Ahorro operativo',
    value: '+40%',
    description: 'Incremento en la eficiencia operativa gracias a la automatización de procesos.',
    icon: 'arrow-up',
    color: '#0077be',
  },
  {
    title: 'Satisfacción del usuario',
    value: '98%',
    description: 'Tasa de satisfacción de los usuarios finales con el portal de servicios.',
    icon: 'smile',
    color: '#f59e0b',
  },
  {
    title: 'Tiempo de respuesta',
    value: '-60%',
    description: 'Reducción del tiempo promedio de atención a emergencias y reportes.',
    icon: 'bolt',
    color: '#ef4444',
  },
];
</script>

<template>
  <div class="services-page">
    <!-- Hero Section -->
    <section class="services-hero">
      <div class="services-hero__waves">
        <svg
          class="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shape-rendering="auto"
        >
          <defs>
            <path id="gentle-wave-services" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g class="parallax">
            <use xlink:href="#gentle-wave-services" x="48" y="0" fill="rgba(0,119,190,0.7)" />
            <use xlink:href="#gentle-wave-services" x="48" y="3" fill="rgba(0,206,209,0.5)" />
            <use xlink:href="#gentle-wave-services" x="48" y="5" fill="rgba(64,224,208,0.3)" />
            <use xlink:href="#gentle-wave-services" x="48" y="7" fill="#f0faff" />
          </g>
        </svg>
      </div>

      <div class="container services-hero__content">
        <div class="services-hero__text">
          <span class="services-hero__badge">Soluciones Integrales</span>
          <h1 class="services-hero__title">Servicios diseñados para <span>transformar</span> tu gestión hídrica</h1>
          <p class="services-hero__description">
            Desde el monitoreo inteligente hasta la facturación automatizada, te acompañamos en cada etapa para que tu acueducto sea más
            eficiente, sostenible y rentable.
          </p>
          <div class="services-hero__actions">
            <button class="btn btn--primary" @click="goToLogin">Solicitar Demo <font-awesome-icon icon="arrow-right" /></button>
            <a href="#servicios" class="btn btn--outline"> Explorar Servicios </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section id="servicios" class="services-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Nuestra <span>suite</span> de servicios</h2>
          <p class="section-subtitle">Tecnología de punta adaptada a las necesidades reales de los acueductos rurales y urbanos.</p>
        </div>

        <div class="services-grid">
          <div v-for="service in services" :key="service.title" class="service-card">
            <div class="service-card__icon" :style="{ backgroundColor: service.color + '15', color: service.color }">
              <font-awesome-icon :icon="service.icon" size="2x" />
            </div>
            <h3 class="service-card__title">{{ service.title }}</h3>
            <p class="service-card__description">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="process-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">¿Cómo <span>empezar</span>?</h2>
          <p class="section-subtitle">Un proceso simple y probado para digitalizar tu acueducto en semanas, no en años.</p>
        </div>

        <div class="process-grid">
          <div v-for="(step, index) in steps" :key="step.number" class="process-card" :class="{ 'process-card--alt': index % 2 !== 0 }">
            <span class="process-card__number">{{ step.number }}</span>
            <h3 class="process-card__title">{{ step.title }}</h3>
            <p class="process-card__description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits / Stats -->
    <section class="benefits-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Resultados que <span>hablan</span></h2>
          <p class="section-subtitle">Nuestros clientes experimentan mejoras tangibles desde el primer trimestre de implementación.</p>
        </div>

        <div class="benefits-grid">
          <div v-for="benefit in benefits" :key="benefit.title" class="benefit-card">
            <div class="benefit-card__top">
              <div class="benefit-card__icon" :style="{ backgroundColor: benefit.color + '15', color: benefit.color }">
                <font-awesome-icon :icon="benefit.icon" size="lg" />
              </div>
              <span class="benefit-card__value" :style="{ color: benefit.color }">{{ benefit.value }}</span>
            </div>
            <h4 class="benefit-card__title">{{ benefit.title }}</h4>
            <p class="benefit-card__description">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-card__content">
            <h2 class="cta-card__title">¿Listo para modernizar tu acueducto?</h2>
            <p class="cta-card__description">
              Únete a las empresas que ya están ahorrando agua, tiempo y dinero con WatSolution. Agenda una demo gratuita y sin compromiso.
            </p>
            <div class="cta-card__actions">
              <button class="btn btn--primary btn--large" @click="goToLogin">
                Comenzar Ahora <font-awesome-icon icon="arrow-right" />
              </button>
              <router-link to="/" class="btn btn--outline btn--large"> Volver al Inicio </router-link>
            </div>
          </div>
          <div class="cta-card__decoration">
            <div class="cta-card__circle"></div>
            <div class="cta-card__circle cta-card__circle--small"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../content/scss/variables' as *;
@use '../../../content/scss/mixins' as *;

/* Hero */
.services-hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
  padding: 6rem 0 8rem;
}

.services-hero__waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  min-height: 100px;
  max-height: 150px;
  z-index: 1;
}

.services-hero__content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.services-hero__badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: 0.5px;
}

.services-hero__title {
  font-size: 2.2rem;
  line-height: 1.2;
  margin-bottom: 1.25rem;
  font-weight: 800;
  color: $color-text;

  span {
    color: $color-primary;
  }

  @include tablet {
    font-size: 3rem;
  }

  @include desktop {
    font-size: 3.5rem;
  }
}

.services-hero__description {
  font-size: 1.1rem;
  color: $color-text-muted;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.services-hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

/* Waves Animation */
.waves {
  position: relative;
  width: 100%;
  height: 100%;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
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
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition:
    transform 0.2s,
    background-color 0.2s;
  min-width: 44px;
  min-height: 44px;
  text-align: center;
  line-height: 1;
  text-decoration: none;
  font-size: 1rem;

  &:active {
    transform: scale(0.98);
  }

  &--primary {
    background-color: $color-primary;
    color: white;

    &:hover {
      background-color: $color-primary-dark;
    }
  }

  &--outline {
    background-color: transparent;
    border: 2px solid $color-primary;
    color: $color-primary;

    &:hover {
      background-color: $color-primary;
      color: white;
    }
  }

  &--large {
    padding: 1rem 2rem;
    font-size: 1.05rem;
  }
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;

  @include desktop {
    margin-bottom: 4rem;
  }
}

.section-title {
  font-size: 1.8rem;
  color: $color-text;
  margin-bottom: 1rem;
  font-weight: 800;

  span {
    color: $color-primary;
  }

  @include tablet {
    font-size: 2.2rem;
  }

  @include desktop {
    font-size: 2.5rem;
  }
}

.section-subtitle {
  font-size: 1.05rem;
  color: $color-text-muted;
  line-height: 1.6;
}

/* Services Section */
.services-section {
  padding: 5rem 0;
  background-color: #ffffff;

  @include desktop {
    padding: 6rem 0;
  }
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

.service-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &:hover {
    transform: translateY(-8px);
    box-shadow: $shadow-lg;
    border-color: $color-primary;
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: 1.2rem;
    font-weight: 700;
    color: $color-text;
  }

  &__description {
    font-size: 0.95rem;
    color: $color-text-muted;
    line-height: 1.6;
    flex: 1;
  }
}

/* Process Section */
.process-section {
  padding: 5rem 0;
  background-color: #f8fafc;

  @include desktop {
    padding: 6rem 0;
  }
}

.process-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

.process-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }

  &--alt {
    background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
    color: white;
    border-color: transparent;

    .process-card__number {
      color: rgba(255, 255, 255, 0.25);
    }

    .process-card__description {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  &__number {
    font-size: 3rem;
    font-weight: 800;
    color: rgba($color-primary, 0.1);
    line-height: 1;
    margin-bottom: 1rem;
    display: block;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: inherit;
  }

  &__description {
    font-size: 0.95rem;
    color: $color-text-muted;
    line-height: 1.6;
  }
}

/* Benefits Section */
.benefits-section {
  padding: 5rem 0;
  background-color: #ffffff;

  @include desktop {
    padding: 6rem 0;
  }
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

.benefit-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__value {
    font-size: 1.75rem;
    font-weight: 800;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    color: $color-text;
    margin-bottom: 0.5rem;
  }

  &__description {
    font-size: 0.9rem;
    color: $color-text-muted;
    line-height: 1.5;
  }
}

/* CTA Section */
.cta-section {
  padding: 5rem 0;
  background-color: #f8fafc;

  @include desktop {
    padding: 6rem 0;
  }
}

.cta-card {
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
  border-radius: 32px;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  text-align: center;

  @include desktop {
    padding: 4rem;
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
  }

  &__content {
    position: relative;
    z-index: 2;
    max-width: 600px;
  }

  &__title {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 1rem;

    @include tablet {
      font-size: 2.2rem;
    }
  }

  &__description {
    font-size: 1.05rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;

    @include desktop {
      justify-content: flex-start;
    }

    .btn--primary {
      background-color: white;
      color: $color-primary;

      &:hover {
        background-color: #f0faff;
      }
    }

    .btn--outline {
      border-color: rgba(255, 255, 255, 0.5);
      color: white;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }
  }

  &__decoration {
    position: relative;
    width: 200px;
    height: 200px;
    flex-shrink: 0;
    display: none;

    @include desktop {
      display: block;
    }
  }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    &--small {
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.12);
    }
  }
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @include tablet {
    padding: 0 2rem;
  }
}
</style>
