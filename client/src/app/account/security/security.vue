<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { setAccessToken } from '@/shared/config/web-session';
const enabled = ref(false),
  available = ref(false),
  busy = ref(false);
const password = ref(''),
  code = ref(''),
  secret = ref(''),
  uri = ref(''),
  message = ref('');
const recovery = ref<string[]>([]);
const completed = ref(false);
onMounted(async () => {
  try {
    const { data } = await axios.get('api/security/mfa');
    enabled.value = data.enabled;
    available.value = data.available;
  } catch {
    message.value = 'No se pudo consultar la seguridad de tu cuenta.';
  }
});
async function action(kind: 'setup' | 'confirm' | 'disable') {
  if (busy.value) return;
  busy.value = true;
  message.value = '';
  try {
    const { data } = await axios.post(`api/security/mfa/${kind}`, { password: password.value, code: code.value.trim() });
    if (data.id_token) setAccessToken(data.id_token);
    password.value = '';
    code.value = '';
    if (kind === 'setup') {
      secret.value = data.secret;
      uri.value = data.uri;
    } else {
      secret.value = '';
      uri.value = '';
      recovery.value = data.recoveryCodes ?? [];
      completed.value = true;
      message.value =
        kind === 'confirm'
          ? 'Segundo factor activado. Guarda los códigos de recuperación en un lugar privado; cada uno sirve una sola vez. Después inicia sesión de nuevo.'
          : 'Segundo factor desactivado. Inicia sesión de nuevo.';
    }
  } catch {
    message.value =
      'No se completó el cambio. Revisa tu contraseña, el código o la conexión. Si acabas de usar un código, espera al siguiente.';
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <section class="container py-4" style="max-width: 680px">
    <h1>Seguridad de tu cuenta</h1>
    <p>El segundo factor protege el inicio de sesión. Las jornadas de la app móvil ya autorizadas pueden continuar sin internet.</p>
    <p role="status">{{ message }}</p>
    <template v-if="!completed && available">
      <p>{{ enabled ? 'Segundo factor activo.' : 'Segundo factor aún no activado.' }}</p>
      <label class="form-label" for="mfa-password">Contraseña actual</label>
      <input id="mfa-password" v-model="password" type="password" autocomplete="current-password" class="form-control mb-3" />
      <button v-if="!enabled && !secret" class="btn btn-primary" :disabled="busy || !password" @click="action('setup')">
        Configurar autenticador
      </button>
      <div v-if="secret" class="my-3">
        <p>En tu aplicación autenticadora añade una cuenta de tipo tiempo (TOTP) con esta clave. La configuración vence en 10 minutos.</p>
        <code style="overflow-wrap: anywhere">{{ secret }}</code>
        <p class="mt-2"><a :href="uri">Abrir en mi autenticador</a></p>
      </div>
      <template v-if="secret || enabled">
        <label for="mfa-code" class="form-label">Código del autenticador{{ enabled ? ' o de recuperación' : '' }}</label>
        <input id="mfa-code" v-model="code" autocomplete="one-time-code" maxlength="64" class="form-control mb-3" />
        <button
          class="btn btn-primary"
          :disabled="busy || !code || (enabled && !password)"
          @click="action(enabled ? 'disable' : 'confirm')"
        >
          {{ enabled ? 'Desactivar segundo factor' : 'Confirmar activación' }}
        </button>
      </template>
    </template>
    <p v-else-if="!completed">La configuración del segundo factor aún no está disponible. Contacta al administrador.</p>
    <div v-if="recovery.length" class="alert alert-warning">
      <p>Estos códigos se muestran una sola vez. No los compartas.</p>
      <ul>
        <li v-for="item in recovery" :key="item">
          <code>{{ item }}</code>
        </li>
      </ul>
    </div>
    <router-link v-if="completed" class="btn btn-primary" to="/login">Ya guardé mis códigos · Iniciar sesión</router-link>
  </section>
</template>
