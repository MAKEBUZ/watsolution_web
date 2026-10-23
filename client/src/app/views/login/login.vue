<script setup lang="ts">
import { setAccessToken } from '@/shared/config/web-session';
import { ref } from 'vue';
import WaterNetwork from '@/core/water/water-network.vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAccountStore } from '@/shared/config/store/account-store';

const router = useRouter();
const store = useAccountStore();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const authenticationError = ref('');
const privacyAccepted = ref(false);
const submitting = ref(false);

const handleLogin = async () => {
  if (submitting.value) return;
  submitting.value = true;
  authenticationError.value = '';
  let loadingAccount = false;
  try {
    const result = await axios.post('api/authenticate', {
      username: username.value.trim(),
      password: password.value,
      rememberMe: rememberMe.value,
    });

    const bearerToken = result.headers.authorization;
    let jwt: string | null = null;
    if (bearerToken && bearerToken.startsWith('Bearer ')) {
      jwt = bearerToken.slice(7);
    } else if (typeof result.data?.id_token === 'string') {
      jwt = result.data.id_token;
    }

    if (!jwt) {
      authenticationError.value = 'El servidor no devolvió una sesión válida. Inténtalo nuevamente.';
      return;
    }

    setAccessToken(jwt);
    loadingAccount = true;
    await store.loadAccountAction();
    if (!store.authenticated) {
      authenticationError.value = 'No se pudo cargar tu cuenta. Inténtalo nuevamente.';
      return;
    }
    const authorities: string[] = store.account?.authorities ?? [];
    if (authorities.includes('ROLE_ADMIN')) {
      await router.replace('/admin');
    } else {
      await router.replace('/portal');
    }
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (loadingAccount) {
      authenticationError.value = 'No se pudo cargar tu cuenta. Inténtalo nuevamente.';
    } else if (status === 401) {
      authenticationError.value = 'Usuario o contraseña incorrectos, o cuenta sin activar. Usa tu nombre de usuario.';
    } else if (status === 403) {
      authenticationError.value = 'El servidor no permite iniciar sesión desde esta web. Contacta al administrador.';
    } else if (status === 429) {
      authenticationError.value = 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.';
    } else if (status && status >= 500) {
      authenticationError.value = 'El servidor no está disponible. Inténtalo nuevamente más tarde.';
    } else if (axios.isAxiosError(error) && !error.response) {
      authenticationError.value = 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.';
    } else {
      authenticationError.value = 'No se pudo iniciar sesión. Inténtalo nuevamente.';
    }
  } finally {
    submitting.value = false;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <section class="auth-scene">
    <aside class="auth-story">
      <p class="ws-eyebrow">CONECTADOS POR EL AGUA</p>
      <h2>Tu agua.<br /><em>Tu tranquilidad.</em></h2>
      <WaterNetwork :progress="1" />
      <p>Un lugar para entender tu consumo,<br />consultar tus facturas y cuidar lo que compartimos.</p>
    </aside>

    <div class="auth-content">
      <div class="auth-card">
        <p class="auth-eyebrow">TU PORTAL WATSOLUTION</p>
        <h1 class="auth-title">Bienvenido de nuevo</h1>
        <p class="auth-intro">Consulta tus facturas, revisa tu consumo y mantente al día con tu servicio.</p>

        <div v-if="authenticationError" class="auth-error" role="alert">{{ authenticationError }}</div>

        <form class="auth-form" :aria-busy="submitting" @submit.prevent="handleLogin">
          <div class="auth-field">
            <label class="auth-label" for="username">Nombre de usuario</label>

            <div class="auth-input">
              <input id="username" v-model="username" class="auth-input__control" type="text" autocomplete="username" required />

              <font-awesome-icon class="auth-input__icon" icon="envelope" :size="18" />
            </div>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="password">Contraseña</label>

            <div class="auth-input">
              <input
                id="password"
                v-model="password"
                class="auth-input__control"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
              />

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
                <input v-model="rememberMe" type="checkbox" />
                <span>Recordarme</span>
              </label>

              <router-link to="/account/reset/request" class="auth-forgot"> ¿Olvidaste tu contraseña? </router-link>
            </div>
          </div>

          <label class="auth-privacy">
            <input v-model="privacyAccepted" type="checkbox" class="auth-privacy__check" />
            <span>
              He leído y acepto la
              <router-link to="/politica-privacidad" target="_blank" class="auth-privacy__link"> Política de Privacidad </router-link>
            </span>
          </label>

          <button class="auth-submit" type="submit" :disabled="!privacyAccepted || submitting">
            {{ submitting ? 'Ingresando…' : 'Ingresar a mi cuenta' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-scene {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 64px max(24px, calc((100vw - 1200px) / 2));
  background: #f4f2e9;
  min-height: calc(100svh - 70px);
  align-items: center;
}
.auth-scene::before,
.auth-scene::after {
  display: none;
}
.auth-story {
  color: #143e43;
  max-width: 500px;
}
.auth-story h2 {
  font-size: clamp(40px, 4.4vw, 64px);
  letter-spacing: -0.05em;
  line-height: 1.04;
  margin: 20px 0;
}
.auth-story em {
  font-family: Georgia, serif;
  color: #087f83;
  font-weight: 400;
}
.auth-story .water-network {
  max-height: 320px;
  margin: 24px 0;
}
.auth-story > p:last-child {
  font-size: 14px;
  line-height: 1.7;
  color: #536b68;
}
.auth-content {
  min-width: 0;
  display: flex;
  justify-content: center;
  padding: 0;
}
.auth-card {
  width: 100%;
  max-width: 470px;
  background: #fffdf8;
  border: 1px solid #d4ddd3;
  border-radius: 4px 32px 32px;
  padding: 40px;
  box-shadow: 0 24px 60px #143e4309;
}
.auth-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #087f83;
  margin-bottom: 20px;
}
.auth-title {
  font-size: 34px;
  letter-spacing: -0.045em;
  line-height: 1.12;
  color: #143e43;
  margin-bottom: 14px;
  text-align: left;
}
.auth-intro {
  font-size: 15px;
  line-height: 1.7;
  color: #536b68;
  margin-bottom: 30px;
}
.auth-form {
  display: grid;
  gap: 22px;
}
.auth-field {
  display: grid;
  gap: 9px;
}
.auth-label {
  font-size: 13px;
  font-weight: 750;
  color: #143e43;
}
.auth-input {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #9cb4aa;
  border-radius: 8px;
  padding: 0 44px 0 14px;
  background: #fffdf8;
  min-height: 54px;
}
.auth-input:focus-within {
  outline: 3px solid #087f8330;
  border-color: #087f83;
}
.auth-input__control {
  width: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  padding: 12px 0;
  font-size: 16px;
  color: #143e43;
}
.auth-input__icon,
.auth-input__button {
  position: absolute;
  right: 8px;
  color: #4d6a63;
}
.auth-input__button {
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: 0;
}
.auth-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
}
.auth-remember,
.auth-privacy {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: #405f58;
  line-height: 1.6;
  font-size: 12px;
}
.auth-remember input,
.auth-privacy input {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: #087f83;
  appearance: auto;
}
.auth-forgot,
.auth-privacy__link {
  color: #076d73;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.auth-submit {
  background: #143e43;
  color: #fffdf5;
  border: 0;
  border-radius: 8px;
  min-height: 54px;
  font-weight: 750;
  font-size: 15px;
  cursor: pointer;
}
.auth-submit:disabled {
  background: #dce5dc;
  color: #536b68;
  cursor: not-allowed;
}
.auth-error {
  padding: 14px;
  background: #ffede5;
  border-left: 3px solid #a64227;
  color: #7d2c19;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}
@media (max-width: 900px) {
  .auth-scene {
    gap: 28px;
    padding: 40px 24px;
  }
  .auth-card {
    padding: 30px;
  }
  .auth-story h2 {
    font-size: 42px;
  }
}
@media (max-width: 650px) {
  .auth-scene {
    grid-template-columns: 1fr;
    padding: 28px 18px;
    gap: 24px;
  }
  .auth-story h2 {
    font-size: 36px;
  }
  .auth-story .water-network,
  .auth-story > p:last-child {
    display: none;
  }
  .auth-story .ws-eyebrow {
    font-size: 9px;
  }
  .auth-story h2 br {
    display: none;
  }
  .auth-card {
    max-width: none;
    padding: 28px 22px;
  }
  .auth-title {
    font-size: 29px;
  }
}
</style>
