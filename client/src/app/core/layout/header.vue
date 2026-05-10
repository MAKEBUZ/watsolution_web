<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useAccountStore } from '@/shared/config/store/account-store';

const accountStore = useAccountStore();
const router = useRouter();
const route = useRoute();

const isMenuOpen = ref(false);
const isScrolled = ref(false);

const isAuthenticated = computed(() => !!accountStore.account);
const isAdmin = computed(() => accountStore.account?.authorities?.includes('ROLE_ADMIN'));

const isWhiteBackground = computed(() => {
  return isScrolled.value || route.path !== '/';
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;

  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  accountStore.initAccount();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const logout = () => {
  accountStore.logout();
  router.push('/');
};

const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Noticias', path: '/noticias' },
  { name: 'Portal Usuario', path: '/portal', requiresAuth: true },
  { name: 'Pagos', path: '/pagos', requiresAuth: true },
  { name: 'Admin', path: '/admin', requiresAuth: true, requiresAdmin: true, nameOverride: 'admin-summary' }
];
</script>

<template>
  <header :class="['header', { 'header--scrolled': isWhiteBackground }]">
    <div class="container header__content">
      <router-link to="/" class="header__logo">
        <div class="header__logo-icons">
          <font-awesome-icon icon="tint" class="header__logo-icon primary" size="2x" />
          <font-awesome-icon icon="tint" class="header__logo-icon secondary" />
        </div>
        <span class="header__logo-text">Wat<span>Solution</span></span>
      </router-link>

      <nav class="header__nav header__nav--desktop">
        <ul class="header__nav-list">
          <template v-for="link in navLinks" :key="link.path">
            <li v-if="(!link.requiresAuth || isAuthenticated) && (!link.requiresAdmin || isAdmin)">
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
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="btn btn--primary">
              Ingresar
            </router-link>
          </template>

          <template v-else>
            <button @click="logout" class="btn btn--outline">
              Cerrar Sesión
            </button>
          </template>
        </div>
      </nav>

      <button 
        class="header__toggle" 
        @click="toggleMenu" 
        aria-label="Abrir menú"
        :aria-expanded="isMenuOpen"
      >
        <font-awesome-icon v-if="!isMenuOpen" icon="bars" size="lg" />
        <font-awesome-icon v-else icon="times" size="lg" />
      </button>

      <Transition name="slide">
        <nav v-if="isMenuOpen" class="header__nav header__nav--mobile">
          <ul class="header__nav-list">
            <template v-for="link in navLinks" :key="link.path">
              <li v-if="(!link.requiresAuth || isAuthenticated) && (!link.requiresAdmin || isAdmin)">
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
            <template v-if="!isAuthenticated">
              <router-link 
                to="/login" 
                class="btn btn--primary"
                @click="toggleMenu"
              >
                Ingresar
              </router-link>
            </template>

            <template v-else>
              <button 
                @click="logout(); toggleMenu()" 
                class="btn btn--outline"
              >
                Cerrar Sesión
              </button>
            </template>
          </div>
        </nav>
      </Transition>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../../content/scss/variables' as *;
@use '../../../content/scss/mixins' as *;

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: $spacing-sm 0;
  transition: all 0.3s ease;
  background: transparent;

  &.header--scrolled {
    background-color: $color-white !important;
    box-shadow: $shadow-sm !important;
    padding: $spacing-xs / 1 0;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    text-decoration: none;

    &-icons {
      position: relative;
      width: 40px;
      height: 40px;
    }

    &-icon {
      position: absolute;

      &.primary {
        color: $color-primary;
        bottom: 0;
        right: 0;
      }

      &.secondary {
        color: $color-secondary;
        top: 4px;
        left: 4px;
      }
    }

    &-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: $color-primary;

      span {
        color: $color-secondary;
      }
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
      list-style: none;
      margin: 0;
      padding: 0;

      @include desktop {
        flex-direction: row;
      }
    }

    &-link {
      font-weight: 500;
      color: $color-text;
      font-size: 1.1rem;
      transition: 0.2s ease;
      text-decoration: none;

      @include desktop {
        font-size: 1rem;
        &:hover {
          color: $color-primary;
        }
      }

      &.router-link-active {
        color: $color-primary;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
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

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &--primary {
    background: $color-primary;
    color: $color-white;

    &:hover {
      background: $color-primary-dark;
    }
  }

  &--outline {
    background: transparent;
    border: 2px solid $color-primary;
    color: $color-primary;

    &:hover {
      background: $color-primary;
      color: $color-white;
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}
</style>
