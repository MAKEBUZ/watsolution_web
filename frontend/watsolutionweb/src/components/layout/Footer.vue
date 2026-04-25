<script setup lang="ts">
import { Droplets, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-vue-next'
</script>

<template>
  <footer id="contacto" class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <div class="footer__logo">
          <Droplets :size="32" />
          <span>Wat<span>Solution</span></span>
        </div>
        <p class="footer__description">
          Liderando la innovación tecnológica para la gestión sostenible del recurso más vital del planeta.
        </p>
        <div class="footer__social">
          <a href="#" aria-label="Facebook"><Facebook :size="20" /></a>
          <a href="#" aria-label="Twitter"><Twitter :size="20" /></a>
          <a href="#" aria-label="LinkedIn"><Linkedin :size="20" /></a>
          <a href="#" aria-label="Instagram"><Instagram :size="20" /></a>
        </div>
      </div>

      <div class="footer__links">
        <h4 class="footer__title">Recursos</h4>
        <ul>
          <li><a href="#">Documentación</a></li>
          <li><a href="#">Guías de Usuario</a></li>
          <li><a href="#">API Reference</a></li>
          <li><a href="#">Soporte Técnico</a></li>
        </ul>
      </div>

      <div class="footer__links">
        <h4 class="footer__title">Empresa</h4>
        <ul>
          <li><a href="#">Sobre Nosotros</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Carreras</a></li>
          <li><a href="#">Contacto</a></li>
        </ul>
      </div>

      <div class="footer__contact">
        <h4 class="footer__title">Contacto</h4>
        <ul>
          <li><Mail :size="18" /> info@watsolution.tech</li>
          <li><Phone :size="18" /> +1 (555) 123-4567</li>
          <li><MapPin :size="18" /> Calle de la Innovación 42, Hub Tecnológico</li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-content">
        <p>&copy; 2026 watsolution. Todos los derechos reservados.</p>
        <div class="footer__legal">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.footer {
  background-color: #0f172a;
  color: #94a3b8;
  padding: $spacing-xl 0 0;

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-xl;
    margin-bottom: $spacing-xl;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @include desktop {
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;

    span span {
      color: $color-secondary;
    }
  }

  &__description {
    line-height: 1.6;
    max-width: 300px;
  }

  &__social {
    display: flex;
    gap: $spacing-md;

    a {
      color: #94a3b8;
      transition: color 0.3s;
      &:hover {
        color: white;
      }
    }
  }

  &__title {
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: $spacing-md;
  }

  &__links ul, &__contact ul {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    li {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
    }

    a {
      &:hover {
        color: white;
      }
    }
  }

  &__bottom {
    border-top: 1px solid #1e293b;
    padding: $spacing-md 0;
    font-size: 0.9rem;

    &-content {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
      align-items: center;
      text-align: center;

      @include tablet {
        flex-direction: row;
        justify-content: space-between;
        text-align: left;
      }
    }
  }

  &__legal {
    display: flex;
    gap: $spacing-md;
  }
}
</style>
