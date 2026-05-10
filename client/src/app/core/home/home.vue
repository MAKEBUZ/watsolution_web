<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const features = [
  {
    title: 'Gestión de Redes',
    description: 'Control total sobre la infraestructura de tuberías y nodos de distribución.',
    icon: 'network-wired',
    color: '#0077be'
  },
  {
    title: 'Monitoreo en Tiempo Real',
    description: 'Visualiza flujos, presiones y niveles de tanques al instante.',
    icon: 'chart-line',
    color: '#00ced1'
  },
  {
    title: 'Reportes Automáticos',
    description: 'Genera informes de consumo y eficiencia hídrica con un solo clic.',
    icon: 'file',
    color: '#40e0d0'
  },
  {
    title: 'Alertas de Mantenimiento',
    description: 'Sistema predictivo de fallas para prevenir fugas y roturas.',
    icon: 'bell',
    color: '#3498db'
  }
];

const testimonials = [
  {
    name: 'Roberto Gómez',
    role: 'Director de Operaciones',
    company: 'Acueducto Metropolitano',
    text: 'watsolution ha transformado nuestra capacidad de respuesta ante fugas. Hemos reducido las pérdidas técnicas en un 15% en solo seis meses.',
    avatar: 'https://i.pravatar.cc/150?u=roberto'
  },
  {
    name: 'Elena Martínez',
    role: 'Ingeniera de Redes',
    company: 'Aguas del Valle',
    text: 'La facilidad de uso de la PWA nos permite que nuestros operarios en campo reporten incidencias con fotos y ubicación GPS en tiempo real.',
    avatar: 'https://i.pravatar.cc/150?u=elena'
  }
];

const goToPortal = () => {
  router.push('/portal');
};
</script>

<template>
  <div class="home-container">
    <!-- Hero Section -->
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
            <button class="btn btn--primary" @click="goToPortal">Comenzar Ahora <font-awesome-icon icon="arrow-right" /></button>
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
              <div class="demos__screen"></div>
              <div class="demos__device-label"><font-awesome-icon icon="tablet-alt" /> Tablet</div>
            </div>
            <div class="demos__device demos__device--mobile">
              <div class="demos__screen"></div>
              <div class="demos__device-label"><font-awesome-icon icon="mobile-alt" /> Mobile</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonios" class="testimonials">
      <div class="container">
        <div class="testimonials__header">
          <h2 class="testimonials__title">Casos de Éxito</h2>
          <p class="testimonials__subtitle">Empresas que ya están optimizando su gestión hídrica con nosotros.</p>
        </div>

        <div class="testimonials__grid">
          <div v-for="testimonial in testimonials" :key="testimonial.name" class="testimonial-card">
            <font-awesome-icon icon="quote-left" class="testimonial-card__quote" size="2x" />
            <p class="testimonial-card__text">{{ testimonial.text }}</p>
            <div class="testimonial-card__footer">
              <img :src="testimonial.avatar" :alt="testimonial.name" class="testimonial-card__avatar" loading="lazy">
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
/* Hero */
.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
}
.hero__waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  min-height: 100px;
  max-height: 150px;
  z-index: 1;
}
.hero__content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 2;
}
@media (min-width: 1024px) {
  .hero__content { grid-template-columns: 1fr 1fr; }
}
.hero__title {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1rem;
  font-weight: 800;
  color: #2c3e50;
}
.hero__title span { color: #0077be; }
@media (min-width: 768px) { .hero__title { font-size: 3.5rem; } }
.hero__description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
  max-width: 500px;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.hero__image {
  display: flex;
  justify-content: center;
  perspective: 1000px;
}
.hero__card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  transform: rotateY(-10deg) rotateX(5deg);
  transition: transform 0.5s ease;
}
.hero__card:hover { transform: rotateY(0deg) rotateX(0deg); }
.hero__card-header {
  display: flex;
  gap: 6px;
  margin-bottom: 2rem;
}
.hero__card-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e2e8f0;
}
.hero__card-dot:nth-child(1) { background: #ff5f56; }
.hero__card-dot:nth-child(2) { background: #ffbd2e; }
.hero__card-dot:nth-child(3) { background: #27c93f; }
.waves { position: relative; width: 100%; height: 100%; }
.parallax > use { animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite; }
.parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
.parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
.parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; }
.parallax > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; }
@keyframes move-forever {
  0% { transform: translate3d(-90px,0,0); }
  100% { transform: translate3d(85px,0,0); }
}
.mockup-graph {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 150px;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}
.mockup-bar {
  flex: 1;
  background: #0077be;
  border-radius: 4px 4px 0 0;
  transition: height 1s ease;
}
.mockup-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.mockup-stat { display: flex; flex-direction: column; }
.mockup-label { font-size: 0.8rem; color: #7f8c8d; }
.mockup-value { font-weight: 700; color: #2c3e50; font-size: 1.2rem; }

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
  transition: transform 0.2s, background-color 0.2s;
  min-width: 44px;
  min-height: 44px;
  text-align: center;
  line-height: 1;
}
.btn:active { transform: scale(0.98); }
.btn--primary {
  background-color: #0077be;
  color: white;
}
.btn--primary:hover {
  background-color: #005f99;
}
.btn--outline {
  background-color: transparent;
  border: 2px solid #0077be;
  color: #0077be;
}
.btn--outline:hover {
  background-color: #0077be;
  color: white;
}

/* Features */
.features { padding: 8rem 0; background-color: #ffffff; }
.features__header {
  text-align: center;
  margin-bottom: 8rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.features__title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 800;
}
.features__title span { color: #0077be; }
@media (min-width: 768px) { .features__title { font-size: 2.5rem; } }
.features__subtitle { font-size: 1.1rem; color: #7f8c8d; }
.features__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 768px) { .features__grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .features__grid { grid-template-columns: repeat(4, 1fr); } }
.feature-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.feature-card:hover { transform: translateY(-10px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); border-color: #0077be; }
.feature-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.feature-card__title { font-size: 1.25rem; font-weight: 700; color: #2c3e50; }
.feature-card__description { font-size: 0.95rem; color: #7f8c8d; line-height: 1.6; flex: 1; }
.feature-card__link { font-size: 0.9rem; font-weight: 600; color: #0077be; margin-top: 1rem; }
.feature-card__link:hover { text-decoration: underline; }

/* Demos */
.demos { padding: 8rem 0; background-color: #f8fafc; overflow: hidden; }
.demos__header { text-align: center; margin-bottom: 8rem; }
.demos__title { font-size: 2rem; color: #2c3e50; margin-bottom: 1rem; font-weight: 800; }
@media (min-width: 768px) { .demos__title { font-size: 2.5rem; } }
.demos__subtitle { font-size: 1.1rem; color: #7f8c8d; }
.demos__display {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  align-items: center;
}
@media (min-width: 1024px) { .demos__display { grid-template-columns: 2fr 1fr; } }
.demos__device {
  background: #1e293b;
  border-radius: 20px;
  padding: 12px;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  position: relative;
}
.demos__device--desktop { aspect-ratio: 16/10; }
.demos__device--tablet { aspect-ratio: 3/4; width: 70%; margin-left: auto; }
.demos__device--mobile { aspect-ratio: 9/16; width: 50%; margin-top: -4rem; }
.demos__device-label {
  position: absolute; bottom: -30px; left: 0; width: 100%; text-align: center;
  font-size: 0.8rem; font-weight: 600; color: #7f8c8d;
  display: flex; align-items: center; justify-content: center; gap: 4px;
}
.demos__screen { background: white; width: 100%; height: 100%; border-radius: 12px; overflow: hidden; }
.demos__side { display: flex; flex-direction: column; gap: 8rem; }
.demos__dashboard-mockup { display: flex; height: 100%; }
.sidebar-mockup { width: 60px; background: #f1f5f9; border-right: 1px solid #e2e8f0; }
.content-mockup {
  flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 12px;
}
.header-mockup { height: 20px; background: #f1f5f9; border-radius: 4px; width: 100%; }
.grid-mockup { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.card-mockup { height: 40px; background: #f1f5f9; border-radius: 4px; }
.chart-mockup { flex: 1; background: linear-gradient(to bottom, #f1f5f9 0%, transparent 100%); border-radius: 4px; }

/* Testimonials */
.testimonials { padding: 8rem 0; background-color: #ffffff; }
.testimonials__header { text-align: center; margin-bottom: 8rem; }
.testimonials__title { font-size: 2rem; font-weight: 800; color: #2c3e50; margin-bottom: 1rem; }
.testimonials__subtitle { font-size: 1.1rem; color: #7f8c8d; }
.testimonials__grid {
  display: grid; grid-template-columns: 1fr; gap: 4rem;
}
@media (min-width: 768px) { .testimonials__grid { grid-template-columns: repeat(2, 1fr); } }
.testimonial-card {
  padding: 4rem; background: #f8fafc; border-radius: 24px; position: relative; transition: transform 0.3s ease;
}
.testimonial-card:hover { transform: scale(1.02); }
.testimonial-card__quote { color: #0077be; opacity: 0.2; margin-bottom: 1rem; }
.testimonial-card__text {
  font-size: 1.2rem; font-style: italic; color: #2c3e50; line-height: 1.6; margin-bottom: 4rem;
}
.testimonial-card__footer { display: flex; align-items: center; gap: 1rem; }
.testimonial-card__avatar {
  width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid #ffffff;
}
.testimonial-card__name { font-weight: 700; color: #2c3e50; }
.testimonial-card__role { font-size: 0.9rem; color: #7f8c8d; }

/* Container */
.container {
  width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem;
}
@media (min-width: 768px) { .container { padding: 0 2rem; } }
</style>
