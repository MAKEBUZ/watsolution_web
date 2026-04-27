<script setup lang="ts">
import { Quote } from 'lucide-vue-next'

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
]
</script>

<template>
  <section id="testimonios" class="testimonials">
    <div class="container">
      <div class="testimonials__header">
        <h2 class="testimonials__title">Casos de Éxito</h2>
        <p class="testimonials__subtitle">Empresas que ya están optimizando su gestión hídrica con nosotros.</p>
      </div>

      <div class="testimonials__grid">
        <div v-for="testimonial in testimonials" :key="testimonial.name" class="testimonial-card">
          <Quote class="testimonial-card__quote" :size="40" />
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
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.testimonials {
  padding: $spacing-xl 0;
  background-color: $color-white;

  &__header {
    text-align: center;
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: 2rem;
    font-weight: 800;
    color: $color-text;
    margin-bottom: $spacing-sm;
  }

  &__subtitle {
    font-size: 1.1rem;
    color: $color-text-muted;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.testimonial-card {
  padding: $spacing-lg;
  background: #f8fafc;
  border-radius: 24px;
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  &__quote {
    color: $color-primary;
    opacity: 0.2;
    margin-bottom: $spacing-sm;
  }

  &__text {
    font-size: 1.2rem;
    font-style: italic;
    color: $color-text;
    line-height: 1.6;
    margin-bottom: $spacing-lg;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid $color-white;
  }

  &__name {
    font-weight: 700;
    color: $color-text;
  }

  &__role {
    font-size: 0.9rem;
    color: $color-text-muted;
  }
}
</style>
