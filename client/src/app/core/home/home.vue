<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAccountStore } from '@/shared/config/store/account-store';
import { useRouter } from 'vue-router';
import WaterNetwork from '@/core/water/water-network.vue';
import WaterJourney from '@/core/water/water-journey.vue';

const router = useRouter();

const features = [
  {
    title: 'Gestión de Redes',
    description: 'Control total sobre la infraestructura de tuberías y nodos de distribución.',
    icon: 'network-wired',
    color: '#0077be',
  },
  {
    title: 'Integración de sensores pendiente',
    description: 'El prototipo no recibe mediciones verificadas de flujo, presión o nivel.',
    icon: 'chart-line',
    color: '#00ced1',
  },
  {
    title: 'Reportes Automáticos',
    description: 'Genera informes de consumo y eficiencia hídrica con un solo clic.',
    icon: 'file',
    color: '#40e0d0',
  },
  {
    title: 'Alertas de Mantenimiento',
    description: 'Capacidad propuesta para una futura integración; no disponible en el prototipo.',
    icon: 'bell',
    color: '#3498db',
  },
];

const testimonials = ref<any[]>([]);
onMounted(async () => {
  try {
    testimonials.value = (await axios.get('api/public/testimonials')).data;
  } catch {
    testimonials.value = [];
  }
});
const account = useAccountStore();

const goToPortal = () => {
  router.push(account.authenticated ? '/portal' : '/login');
};
</script>

<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section id="inicio" class="hero">
      <div class="hero__waves">
        <svg
          class="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shape-rendering="auto"
        >
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g class="parallax">
            <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(0,119,190,0.7)" />
            <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(0,206,209,0.5)" />
            <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(64,224,208,0.3)" />
            <use xlink:href="#gentle-wave" x="48" y="7" fill="#f0faff" />
          </g>
        </svg>
      </div>

      <div class="container hero__content">
        <div class="hero__text">
          <p class="hero__eyebrow">WATSOLUTION · GESTIÓN DEL AGUA</p>
          <h1 class="hero__title">Cada gota tiene<br /><span>un camino.</span></h1>
          <p class="hero__description">
            Consulta tus facturas, conoce tu consumo y accede a la información de tu acueducto en un solo lugar.
          </p>
          <div class="hero__actions">
            <button class="btn btn--primary" @click="goToPortal">Ingresar a mi cuenta <font-awesome-icon icon="arrow-right" /></button>
            <a class="btn btn--outline" href="#dashboard">Explorar el portal</a>
          </div>
          <a class="hero__scroll-link" href="#water-story">Descubre el recorrido del agua <span aria-hidden="true">&darr;</span></a>
        </div>
        <div class="hero__image">
          <div class="hero__illustration">
            <WaterNetwork :progress="0.72" /><span class="hero__seal">DEL ORIGEN<br />A TU HOGAR</span>
          </div>
          <p class="hero__caption">Una red de personas. Un recurso que compartimos.</p>
        </div>
      </div>
    </section>

    <WaterJourney />
    <!-- Features Section -->
    <section id="caracteristicas" class="features">
      <div class="container">
        <div class="features__header">
          <h2 class="features__title">Soluciones Avanzadas para el <span>Agua</span></h2>
          <p class="features__subtitle">Tecnología diseñada específicamente para los retos de la gestión hídrica moderna.</p>
        </div>

        <div class="features__grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-card__icon" :style="{ backgroundColor: feature.color + '20', color: feature.color }">
              <font-awesome-icon :icon="feature.icon" size="2x" />
            </div>
            <h3 class="feature-card__title">{{ feature.title }}</h3>
            <p class="feature-card__description">{{ feature.description }}</p>
            <a href="#" class="feature-card__link">Saber más →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Demos Section -->
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
            <div class="demos__device-label"><font-awesome-icon icon="tachometer-alt" /> Desktop</div>
          </div>

          <div class="demos__side">
            <div class="demos__device demos__device--tablet">
              <div class="demos__screen"><WaterNetwork :progress="1" /></div>
              <div class="demos__device-label"><font-awesome-icon icon="tablet-alt" /> Tablet</div>
            </div>
            <div class="demos__device demos__device--mobile">
              <div class="demos__screen"><WaterNetwork :progress="0.85" /></div>
              <div class="demos__device-label"><font-awesome-icon icon="mobile-alt" /> Mobile</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section v-if="testimonials.length" id="testimonios" class="testimonials">
      <div class="container">
        <div class="testimonials__header">
          <h2 class="testimonials__title">Voces de nuestra comunidad</h2>
          <p class="testimonials__subtitle">Experiencias compartidas por quienes usan WatSolution.</p>
        </div>

        <div class="testimonials__grid">
          <div v-for="testimonial in testimonials" :key="testimonial.name" class="testimonial-card">
            <font-awesome-icon icon="quote-left" class="testimonial-card__quote" size="2x" />
            <p class="testimonial-card__text">{{ testimonial.text }}</p>
            <div class="testimonial-card__footer">
              <span
                class="testimonial-card__avatar"
                aria-hidden="true"
                style="display: grid; place-items: center; background: #d9ede2; color: #176b61; font-weight: 700"
                >{{ testimonial.name.slice(0, 1) }}</span
              >
              <div class="testimonial-card__info">
                <h4 class="testimonial-card__name">{{ testimonial.name }}</h4>
                <p class="testimonial-card__role">{{ testimonial.role }}, {{ testimonial.company }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  background: #fffdf5;
  color: #143e43;
}
.hero {
  position: relative;
  overflow: hidden;
  padding: 84px 0 74px;
  background: #fffdf5;
}
.hero__waves {
  display: none;
}
.hero__content {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 50px;
  align-items: center;
  max-width: 1240px;
}
.hero__eyebrow {
  font-size: 10px;
  letter-spacing: 0.2em;
  font-weight: 800;
  color: #076d73;
  margin-bottom: 28px;
}
.hero__title {
  font-size: clamp(48px, 6.8vw, 92px);
  font-weight: 750;
  letter-spacing: -0.065em;
  line-height: 0.99;
  margin: 0 0 28px;
  color: #143e43;
}
.hero__title span {
  font:
    italic 1.08em Georgia,
    serif;
  color: #087f83;
}
.hero__description {
  font-size: 18px;
  line-height: 1.75;
  color: #536b68;
  max-width: 440px;
  margin-bottom: 32px;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.hero__illustration {
  position: relative;
  background: #e6f0e8;
  border-radius: 48% 48% 12px 12px;
  padding: 25px 12px 0;
}
.hero__seal {
  position: absolute;
  right: 5px;
  top: 30px;
  border: 1px solid #143e43;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: grid;
  place-content: center;
  transform: rotate(12deg);
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.15em;
  background: #e5c587;
}
.hero__caption {
  font-size: 12px;
  text-align: center;
  color: #536b68;
  margin-top: 16px;
}
.features,
.demos,
.testimonials {
  padding: 90px 0;
}
.features__header,
.demos__header,
.testimonials__header {
  max-width: 760px;
  margin-bottom: 40px;
}
.features__title,
.demos__title,
.testimonials__title {
  font-size: clamp(30px, 3.8vw, 48px);
  letter-spacing: -0.045em;
  line-height: 1.12;
  color: #143e43;
  margin-bottom: 16px;
}
.features__subtitle,
.demos__subtitle,
.testimonials__subtitle {
  font-size: 16px;
  color: #536b68;
  line-height: 1.7;
}
.features__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.feature-card {
  padding: 28px 24px;
  border-top: 3px solid #087f83;
  background: #f4f2e9;
  border-radius: 0 0 20px 20px;
  display: flex;
  flex-direction: column;
}
.feature-card__icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  margin-bottom: 26px;
}
.feature-card__title {
  font-size: 20px;
  letter-spacing: -0.025em;
  margin-bottom: 14px;
}
.feature-card__description {
  font-size: 14px;
  color: #536b68;
  line-height: 1.75;
  flex: 1;
}
.feature-card__link {
  font-size: 13px;
  color: #076d73;
  font-weight: 700;
  margin-top: 24px;
}
.demos {
  background: #143e43;
  color: #fffdf5;
}
.demos__title {
  color: #fffdf5;
}
.demos__subtitle {
  color: #b9d4cc;
}
.demos__display {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 32px;
  align-items: center;
}
.demos__screen {
  border: 9px solid #264e50;
  border-radius: 22px;
  background: #f4f2e9;
  overflow: hidden;
  min-height: 180px;
}
.demos__device-label {
  font-size: 12px;
  margin: 12px 0;
  color: #c2ddd3;
}
.demos__side {
  display: grid;
  grid-template-columns: 1fr 0.6fr;
  gap: 20px;
  align-items: end;
}
.demos__dashboard-mockup {
  display: flex;
  height: 320px;
  padding: 12px;
}
.sidebar-mockup {
  width: 18%;
  background: #143e43;
  border-radius: 8px;
}
.content-mockup {
  flex: 1;
  padding: 14px;
}
.header-mockup {
  height: 24px;
  background: #d5e5db;
  border-radius: 4px;
  margin-bottom: 18px;
}
.grid-mockup {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.card-mockup {
  height: 48px;
  border-radius: 6px;
  background: #b8dcd2;
}
.chart-mockup {
  height: 135px;
  margin-top: 14px;
  background:
    repeating-linear-gradient(0deg, transparent 0, transparent 25px, #c9dcd3 26px), linear-gradient(160deg, transparent 48%, #078b9140 49%);
  border-radius: 8px;
}
.testimonials > p {
  max-width: 1200px;
  margin: 0 auto 24px;
  padding: 0 24px;
  font-size: 12px;
  color: #536b68;
}
.testimonials__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.testimonial-card {
  border: 1px solid #d6dfd5;
  border-radius: 4px 24px 24px;
  padding: 32px;
  background: #fffdf5;
}
.testimonial-card__quote {
  color: #087f83;
  margin-bottom: 20px;
}
.testimonial-card__text {
  font:
    italic 20px/1.6 Georgia,
    serif;
}
.testimonial-card__footer {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 24px;
}
.testimonial-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #d5e5db;
}
.testimonial-card__name {
  font-size: 15px;
}
.testimonial-card__role {
  font-size: 12px;
  color: #536b68;
}
@media (max-width: 900px) {
  .features__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .hero__content {
    gap: 24px;
  }
  .hero__seal {
    width: 75px;
    height: 75px;
    font-size: 8px;
  }
  .demos__display {
    grid-template-columns: 1fr;
  }
  .demos__side {
    max-width: 460px;
  }
  .hero__title {
    font-size: 60px;
  }
}
@media (max-width: 600px) {
  .hero {
    padding: 42px 0 48px;
  }
  .hero__content {
    grid-template-columns: 1fr;
  }
  .hero__title {
    font-size: 58px;
  }
  .hero__description {
    font-size: 16px;
  }
  .hero__actions .btn {
    width: 100%;
  }
  .hero__image {
    margin-top: 20px;
  }
  .features,
  .demos,
  .testimonials {
    padding: 55px 0;
  }
  .features__grid,
  .testimonials__grid {
    grid-template-columns: 1fr;
  }
  .feature-card {
    padding: 26px;
  }
  .feature-card__icon {
    margin-bottom: 18px;
  }
  .demos__dashboard-mockup {
    height: 240px;
  }
  .chart-mockup {
    height: 80px;
  }
  .testimonial-card {
    padding: 24px;
  }
}
.hero__scroll-link {
  display: inline-flex;
  gap: 22px;
  align-items: center;
  margin-top: 25px;
  font-size: 12px;
  color: #396a60;
  text-decoration: none;
  border-bottom: 1px solid #b7cabc;
  padding-bottom: 8px;
}
.hero__scroll-link span {
  font-size: 22px;
}
.hero__scroll-link:hover {
  color: #087f83;
  border-color: #087f83;
}
</style>
