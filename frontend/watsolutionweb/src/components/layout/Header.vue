<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, Droplets } from 'lucide-vue-next'

import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isMenuOpen = ref(false)
const isScrolled = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Noticias', path: '/noticias' },
  { name: 'Portal Usuario', path: '/portal', requiresAuth: true },
  { name: 'Pagos', path: '/pagos', requiresAuth: true },
  { name: 'Admin', path: '/admin', requiresAuth: true, requiresAdmin: true, nameOverride: 'admin-summary' }
]
</script>

<template>
  <header :class="['header', { 'header--scrolled': isScrolled }]">
    <div class="container header__content">
      <div class="header__logo">
        <Droplets class="header__logo-icon" :size="32" />
        <span class="header__logo-text">Wat<span>Solution</span></span>
      </div>

      <!-- Desktop Navigation -->
      <nav class="header__nav header__nav--desktop">
        <ul class="header__nav-list">
          <template v-for="link in navLinks" :key="link.path">
            <li v-if="(!link.requiresAuth || authStore.isAuthenticated) && (!link.requiresAdmin || authStore.isAdmin)">
              <router-link 
                :to="link.nameOverride ? { name: link.nameOverride } : link.path" 
                class="header__nav-link"
              >
                {{ link.name }}
              </router-link>
            </li>
          </template>
        </ul>
        <div class="header__actions">
          <template v-if="!authStore.isAuthenticated">
            <router-link to="/login" class="btn btn--primary">Ingresar</router-link>
          </template>
          <template v-else>
            <button @click="handleLogout" class="btn btn--outline">Cerrar Sesión</button>
          </template>
        </div>
      </nav>

      <!-- Mobile Toggle -->
      <button 
        class="header__toggle" 
        @click="toggleMenu" 
        aria-label="Abrir menú"
        :aria-expanded="isMenuOpen"
      >
        <Menu v-if="!isMenuOpen" :size="28" />
        <X v-else :size="28" />
      </button>

      <!-- Mobile Navigation -->
      <Transition name="slide">
        <nav v-if="isMenuOpen" class="header__nav header__nav--mobile">
          <ul class="header__nav-list">
            <template v-for="link in navLinks" :key="link.path">
              <li v-if="(!link.requiresAuth || authStore.isAuthenticated) && (!link.requiresAdmin || authStore.isAdmin)">
                <router-link 
                  :to="link.nameOverride ? { name: link.nameOverride } : link.path" 
                  class="header__nav-link" 
                  @click="toggleMenu"
                >
                  {{ link.name }}
                </router-link>
              </li>
            </template>
          </ul>
          <div class="header__actions">
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="btn btn--primary" @click="toggleMenu">Ingresar</router-link>
            </template>
            <template v-else>
              <button @click="handleLogout(); toggleMenu()" class="btn btn--outline">Cerrar Sesión</button>
            </template>
          </div>
        </nav>
      </Transition>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: $spacing-sm 0;
  transition: all 0.3s ease;
  background: transparent;

  &--scrolled {
    background: color.change($color-white, $alpha: 0.9);
    backdrop-filter: blur(10px);
    box-shadow: $shadow-sm;
    padding: $spacing-xs 0;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: 1.5rem;
    font-weight: 700;
    color: $color-primary;

    &-text {
      span {
        color: $color-secondary;
      }
    }

    &-icon {
      color: $color-secondary;
    }
  }

  &__nav {
    &--desktop {
      display: none;
      @include desktop {
        display: flex;
        align-items: center;
        gap: $spacing-md;
      }
    }

    &--mobile {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: $color-white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: $spacing-lg;
      z-index: -1;

      @include desktop {
        display: none;
      }
    }

    &-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $spacing-md;

      @include desktop {
        flex-direction: row;
        gap: $spacing-md;
      }
    }

    &-link {
      font-weight: 500;
      color: $color-text;
      font-size: 1.1rem;

      @include desktop {
        font-size: 1rem;
        &:hover {
          color: $color-primary;
        }
      }
    }
  }

  &__toggle {
    background: none;
    border: none;
    color: $color-primary;
    cursor: pointer;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;

    @include desktop {
      display: none;
    }
  }
}

// Transitions
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}
</style>
