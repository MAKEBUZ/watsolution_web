<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAccountStore } from '@/shared/config/store/account-store';

const router = useRouter();
const store = useAccountStore();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const authenticationError = ref(false);
const privacyAccepted = ref(false);

const handleLogin = async () => {
  authenticationError.value = false;
  try {
    const result = await axios.post('api/authenticate', {
      username: username.value,
      password: password.value,
      rememberMe: rememberMe.value,
    });

    const bearerToken = result.headers.authorization;
    let jwt: string | null = null;
    if (bearerToken && bearerToken.startsWith('Bearer ')) {
      jwt = bearerToken.slice(7);
    } else if (result.data?.id_token) {
      jwt = result.data.id_token;
    }

    if (jwt) {
      if (rememberMe.value) {
        localStorage.setItem('jhi-authenticationToken', jwt);
        sessionStorage.removeItem('jhi-authenticationToken');
      } else {
        sessionStorage.setItem('jhi-authenticationToken', jwt);
        localStorage.removeItem('jhi-authenticationToken');
      }
    }

    await store.loadAccountAction();
    const authorities: string[] = store.account?.authorities ?? [];
    if (authorities.includes('ROLE_ADMIN')) {
      await router.replace('/admin');
    } else {
      await router.replace('/portal');
    }
  } catch {
    authenticationError.value = true;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
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
      <div class="auth-card">
        <h1 class="auth-title">LOGIN</h1>

        <div v-if="authenticationError" class="auth-error">
          Usuario o contraseña incorrectos.
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="auth-field">
            <label class="auth-label" for="username">Email</label>

            <div class="auth-input">
              <input
                id="username"
                v-model="username"
                class="auth-input__control"
                type="text"
                autocomplete="username"
                required
              >

              <font-awesome-icon class="auth-input__icon" icon="envelope" :size="18" />
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
                <font-awesome-icon v-if="showPassword" icon="eye-slash" :size="18" />
                <font-awesome-icon v-else icon="eye" :size="18" />
              </button>
            </div>

            <div class="auth-row">
              <label class="auth-remember">
                <input v-model="rememberMe" type="checkbox">
                <span>Remember Me</span>
              </label>

              <router-link to="/account/reset/request" class="auth-forgot">
                Forgot Password?
              </router-link>
            </div>
          </div>

          <label class="auth-privacy">
            <input v-model="privacyAccepted" type="checkbox" class="auth-privacy__check">
            <span>
              He leído y acepto la
              <router-link to="/politica-privacidad" target="_blank" class="auth-privacy__link">
                Política de Privacidad
              </router-link>
            </span>
          </label>

          <button class="auth-submit" type="submit" :disabled="!privacyAccepted">
            Login
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../../content/scss/variables' as *;

.auth-scene {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: calc(clamp(18px, 3.4vw, 36px) + 70px) clamp(18px, 3.4vw, 36px) clamp(18px, 3.4vw, 36px);
  background: linear-gradient(180deg, #d7e6ff 0%, #c8dcff 42%, #0f2f4b 100%);
}

.auth-scene::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.98) 0 140px, rgba(255, 255, 255, 0) 141px),
    radial-gradient(circle at 18% 30%, rgba(255, 255, 255, 0.85) 0 88px, rgba(255, 255, 255, 0) 89px),
    radial-gradient(circle at 26% 26%, rgba(255, 255, 255, 0.85) 0 70px, rgba(255, 255, 255, 0) 71px),
    radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.85) 0 92px, rgba(255, 255, 255, 0) 93px),
    radial-gradient(circle at 74% 28%, rgba(255, 255, 255, 0.78) 0 84px, rgba(255, 255, 255, 0) 85px),
    radial-gradient(circle at 82% 26%, rgba(255, 255, 255, 0.78) 0 66px, rgba(255, 255, 255, 0) 67px),
    radial-gradient(circle at 90% 30%, rgba(255, 255, 255, 0.78) 0 88px, rgba(255, 255, 255, 0) 89px);
  filter: blur(0.2px);
  opacity: 0.95;
  pointer-events: none;
  z-index: 0;
}

.auth-scene::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 38%, rgba(10, 22, 36, 0.18) 100%),
    radial-gradient(circle at 22% 22%, rgba(90, 160, 220, 0.16) 0%, rgba(90, 160, 220, 0) 58%),
    radial-gradient(circle at 78% 26%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 60%);
  opacity: 0.95;
  pointer-events: none;
  z-index: 1;
}

.auth-art {
  position: absolute;
  inset: -2vh -8vw;
  width: calc(100% + 16vw);
  height: calc(100% + 4vh);
  z-index: 0;
  pointer-events: none;
  opacity: 0.92;
  filter: saturate(0.92) brightness(0.96) contrast(1.05) blur(0.35px);
}

.auth-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(10px, 2.6vw, 22px) 0 clamp(26px, 5.8vw, 44px);
}

.auth-card {
  width: min(560px, 92vw);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 255, 0.85) 0%, rgba(200, 225, 255, 0.62) 48%, rgba(28, 83, 125, 0.42) 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 30px 80px rgba(9, 26, 45, 0.45);
  backdrop-filter: blur(18px);
  padding: clamp(22px, 4.5vw, 38px) clamp(20px, 4.2vw, 44px) clamp(18px, 4vw, 34px);
}

.auth-title {
  text-align: center;
  font-size: clamp(22px, 2.2vw, 30px);
  letter-spacing: 0.06em;
  font-weight: 800;
  color: rgba(7, 14, 26, 0.9);
  margin-bottom: clamp(16px, 2.4vw, 24px);
}

.auth-error {
  margin: 0 auto 16px;
  width: 100%;
  max-width: 420px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 120, 120, 0.35);
  color: rgba(140, 15, 15, 0.95);
  font-size: 0.9rem;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(10, 20, 35, 0.72);
}

.auth-input {
  position: relative;
  display: flex;
  align-items: center;
  padding: 6px 40px 6px 0;
  border-bottom: 1px solid rgba(10, 20, 35, 0.42);
}

.auth-input__control {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  padding: 8px 0;
  color: rgba(6, 12, 22, 0.92);
}

.auth-input__control::placeholder {
  color: rgba(6, 12, 22, 0.45);
}

.auth-input:focus-within {
  border-bottom-color: rgba(0, 0, 0, 0.7);
}

.auth-input__icon,
.auth-input__button {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(10, 20, 35, 0.58);
}

.auth-input__button {
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.auth-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 2px;
}

.auth-remember {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(10, 20, 35, 0.72);
  font-weight: 600;
  letter-spacing: 0.02em;
  user-select: none;
}

.auth-remember input {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(10, 20, 35, 0.28);
  background: rgba(255, 255, 255, 0.92);
  display: inline-grid;
  place-items: center;
}

.auth-remember input:checked {
  background: rgba(255, 255, 255, 0.98);
}

.auth-remember input:checked::after {
  content: '';
  width: 8px;
  height: 5px;
  border-left: 2px solid rgba(10, 20, 35, 0.7);
  border-bottom: 2px solid rgba(10, 20, 35, 0.7);
  transform: rotate(-45deg);
}

.auth-forgot {
  font-size: 0.82rem;
  color: rgba(10, 20, 35, 0.72);
  font-weight: 700;
}

.auth-submit {
  margin-top: 10px;
  height: 52px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: linear-gradient(180deg, rgba(168, 197, 255, 0.95) 0%, rgba(114, 144, 214, 0.95) 100%);
  box-shadow: 0 18px 35px rgba(9, 26, 45, 0.35);
  color: rgba(255, 255, 255, 0.96);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  cursor: pointer;
}

.auth-submit:active {
  transform: translateY(1px);
}

.auth-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.auth-submit:disabled:active {
  transform: none;
}

.auth-privacy {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: rgba(10, 20, 35, 0.72);
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.4;
  user-select: none;
  cursor: pointer;
  margin-top: -4px;
}

.auth-privacy__check {
  appearance: none;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: 4px;
  border: 1px solid rgba(10, 20, 35, 0.28);
  background: rgba(255, 255, 255, 0.92);
  display: inline-grid;
  place-items: center;
  cursor: pointer;
}

.auth-privacy__check:checked {
  background: rgba(255, 255, 255, 0.98);
}

.auth-privacy__check:checked::after {
  content: '';
  width: 8px;
  height: 5px;
  border-left: 2px solid rgba(10, 20, 35, 0.7);
  border-bottom: 2px solid rgba(10, 20, 35, 0.7);
  transform: rotate(-45deg);
}

.auth-privacy__link {
  color: rgba(30, 80, 160, 0.9);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.auth-privacy__link:hover {
  color: rgba(30, 80, 160, 1);
}
</style>
