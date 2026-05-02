<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Mail, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  if (email.value === 'admin@watsolution.tech' && password.value === 'admin123') {
    authStore.login({
      id: '1',
      name: 'Administrador',
      email: email.value,
      role: 'admin'
    })
    
    // Use replace to avoid back button issues and ensure navigation
    await router.replace({ name: 'admin-summary' })
  } else if (email.value === 'usuario@watsolution.tech' && password.value === 'user123') {
    authStore.login({
      id: '2',
      name: 'Juan Pérez',
      email: email.value,
      role: 'user'
    })
    await router.replace({ name: 'user-portal' })
  } else {
    error.value = 'Credenciales inválidas. Prueba con admin@watsolution.tech / admin123'
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <section class="auth-scene">
    <svg class="auth-art" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9fc3ef" stop-opacity="0.65" />
          <stop offset="1" stop-color="#5d93d3" stop-opacity="0.85" />
        </linearGradient>
        <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#6ba1df" stop-opacity="0.75" />
          <stop offset="1" stop-color="#2e5f9b" stop-opacity="0.9" />
        </linearGradient>
        <linearGradient id="m3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1a4e73" stop-opacity="0.9" />
          <stop offset="1" stop-color="#07192b" stop-opacity="1" />
        </linearGradient>
      </defs>

      <g opacity="0.9" fill="#ffffff">
        <path d="M115 260c35-60 120-80 175-40 20-35 62-52 102-40 25-45 80-65 130-45 55 23 70 85 38 127H115z" opacity="0.55" />
        <path d="M980 240c35-55 115-74 168-38 18-32 58-48 96-38 24-40 70-58 116-40 52 21 66 78 36 116H980z" opacity="0.5" />
      </g>

      <path d="M0 585C190 500 350 520 470 575c120 56 260 55 360-10 120-79 260-112 610 20v330H0V585z" fill="url(#m1)" />
      <path d="M0 650c190-110 360-100 520-32 160 68 320 58 430-12 140-90 280-110 490-22v360H0V650z" fill="url(#m2)" />
      <path d="M0 735c190-110 390-120 560-40 170 80 340 70 470-10 170-104 280-108 410-55v340H0V735z" fill="url(#m3)" />

      <g fill="#050d18" opacity="0.9">
        <path d="M128 812l24-68 24 68h-14l-4 34h-12l-4-34h-14z" />
        <path d="M184 826l18-50 18 50h-10l-3 24h-10l-3-24h-10z" />
        <path d="M1248 812l24-68 24 68h-14l-4 34h-12l-4-34h-14z" />
        <path d="M1192 826l18-50 18 50h-10l-3 24h-10l-3-24h-10z" />
      </g>

      <g fill="#050d18" opacity="0.92">
        <path d="M0 900V610c22 30 36 58 44 86 10 34 10 76 10 204H0z" />
        <path d="M40 900V640c34 34 54 70 60 108 8 50 7 90 7 152H40z" />
        <path d="M1440 900V620c-22 28-36 56-44 84-10 34-10 76-10 196h54z" />
        <path d="M1400 900V650c-34 34-54 70-60 108-8 50-7 90-7 142h67z" />
      </g>
    </svg>

    <div class="auth-content">
      <div class="auth-card" role="region" aria-label="Formulario de inicio de sesión">
        <h1 class="auth-title">LOGIN</h1>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="auth-field">
            <label class="auth-label" for="email">Email</label>
            <div class="auth-input">
              <input
                id="email"
                v-model="email"
                class="auth-input__control"
                type="email"
                autocomplete="email"
                required
              >
              <Mail class="auth-input__icon" :size="18" aria-hidden="true" />
            </div>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="password">Password</label>
            <div class="auth-input">
              <input
                id="password"
                v-model="password"
                class="auth-input__control"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
              >
              <button
                type="button"
                class="auth-input__button"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="togglePasswordVisibility"
              >
                <Eye v-if="showPassword" :size="18" aria-hidden="true" />
                <EyeOff v-else :size="18" aria-hidden="true" />
              </button>
            </div>
            <div class="auth-row">
              <label class="auth-remember">
                <input v-model="rememberMe" type="checkbox">
                <span>Remember Me</span>
              </label>
              <a class="auth-forgot" href="#" @click.prevent>Forgot Password?</a>
            </div>
          </div>

          <button class="auth-submit" type="submit">Login</button>
        </form>
      </div>
    </div>
  </section>
</template>
