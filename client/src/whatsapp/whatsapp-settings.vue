<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  getAccessToken,
  getSessionGeneration,
  refreshAccessToken,
  setAccessToken,
  logoutStorageKey,
} from '../app/shared/config/web-session';

const loading = ref(true),
  busy = ref(false),
  signedIn = ref(false),
  error = ref(''),
  notice = ref('');
const profile = ref<{
  linked: boolean;
  phone: string | null;
  notifications: boolean;
  notificationsAvailable: boolean;
  expiresAt: string | null;
  businessPhone: string | null;
} | null>(null);
const phone = ref('57'),
  code = ref(''),
  expiresAt = ref(''),
  consent = ref(false),
  showUnlink = ref(false);
const currentTime = ref(Date.now());
let clock: ReturnType<typeof setInterval>;
const remaining = computed(() => Math.max(0, Math.ceil((new Date(expiresAt.value).getTime() - currentTime.value) / 1000)) || 0);
const chatUrl = computed(() =>
  profile.value?.businessPhone && code.value && remaining.value > 0
    ? `https://wa.me/${profile.value.businessPhone}?text=${encodeURIComponent('VINCULAR ' + code.value)}`
    : null,
);

async function api(path = '', method = 'GET', body?: object) {
  const generation = getSessionGeneration();
  const request = () =>
    fetch('/api/whatsapp/account' + path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${getAccessToken()}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  let response = await request();
  if (response.status === 401) {
    await refreshAccessToken();
    response = await request();
  }
  const data = await response.json();
  if (generation !== getSessionGeneration()) throw new Error('La sesión cambió. Vuelve a iniciar sesión.');
  if (!response.ok) throw new Error(typeof data.message === 'string' ? data.message : 'No se pudo completar la solicitud.');
  return data;
}
function reload() {
  window.location.reload();
}
async function refresh() {
  profile.value = await api();
  consent.value = !!profile.value?.notifications;
  if (profile.value?.linked) {
    code.value = '';
    expiresAt.value = '';
  }
}
async function action(work: () => Promise<void>) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  notice.value = '';
  try {
    await work();
  } catch (e: any) {
    error.value = e.message || 'No se pudo completar la solicitud.';
  } finally {
    busy.value = false;
  }
}
async function generate() {
  await action(async () => {
    const result = await api('/link-code', 'POST', { phone: phone.value.replace(/[\s+()-]/g, '') });
    code.value = result.code;
    expiresAt.value = result.expiresAt;
    currentTime.value = Date.now();
  });
}
async function savePreferences() {
  await action(async () => {
    profile.value = await api('/notifications', 'PATCH', { enabled: consent.value });
    notice.value = consent.value ? 'Avisos activados para este número.' : 'Avisos desactivados.';
  });
}
async function unlink() {
  await action(async () => {
    await api('', 'DELETE');
    code.value = '';
    expiresAt.value = '';
    showUnlink.value = false;
    await refresh();
    notice.value = 'WhatsApp desvinculado.';
  });
}
function clearSession(event: StorageEvent) {
  if (event.key === logoutStorageKey && event.newValue) {
    setAccessToken(null);
    profile.value = null;
    code.value = '';
    signedIn.value = false;
  }
}
onMounted(async () => {
  window.addEventListener('storage', clearSession);
  clock = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
  try {
    await refreshAccessToken();
    signedIn.value = true;
    await refresh();
  } catch (e: any) {
    if (signedIn.value) error.value = e.message;
  } finally {
    loading.value = false;
  }
});
onUnmounted(() => {
  clearInterval(clock);
  window.removeEventListener('storage', clearSession);
});
</script>

<template>
  <header><a href="/" class="brand">WatSolution</a><a href="/portal">Volver a mi cuenta</a></header>
  <main>
    <p class="eyebrow">Tu cuenta, también en WhatsApp</p>
    <h1>Facturas y consumo,<br />a un mensaje de distancia.</h1>
    <p class="intro">Vincula tu número para consultar tu información y elegir si quieres recibir avisos de tus facturas.</p>
    <p v-if="loading" role="status">Comprobando tu sesión…</p>
    <section v-else-if="!signedIn" class="card">
      <h2>Primero, inicia sesión</h2>
      <p>
        Usa tu cuenta de WatSolution para verificar a qué suscriptor pertenece este WhatsApp. Después de iniciar sesión, vuelve a esta
        página.
      </p>
      <a class="button" href="/login">Iniciar sesión</a>
      <button class="secondary" @click="reload">Ya inicié sesión</button>
    </section>
    <template v-else>
      <div v-if="error" role="alert" class="alert error">{{ error }}</div>
      <div v-if="notice" role="status" class="alert">{{ notice }}</div>
      <template v-if="profile">
        <section class="card" v-if="!profile.linked">
          <span class="step">01 · Vincula tu número</span>
          <h2>Verifica tu WhatsApp</h2>
          <p>Introduce el número desde el que harás las consultas. El código solo funcionará al enviarlo desde ese mismo número.</p>
          <form @submit.prevent="generate">
            <label for="phone">Número con código de país</label>
            <input
              id="phone"
              v-model="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              maxlength="24"
              required
              placeholder="Ejemplo: 573001234567"
              :disabled="busy"
            />
            <p class="hint">Para Colombia: 57 + los 10 dígitos de tu celular.</p>
            <button :disabled="busy">{{ busy ? 'Procesando…' : 'Generar código' }}</button>
          </form>
          <div v-if="code" class="code-box" aria-live="polite">
            <template v-if="remaining > 0">
              <p>Envía este mensaje al WhatsApp de WatSolution:</p>
              <code>VINCULAR {{ code }}</code>
              <p class="hint">Válido durante {{ Math.ceil(remaining / 60) }} minutos. No compartas este código.</p>
              <a v-if="chatUrl" :href="chatUrl" class="button" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
              <p v-else>Abre el chat de WatSolution donde recibiste el mensaje de bienvenida y envía el código.</p>
              <button class="secondary" :disabled="busy" @click="action(refresh)">Ya envié el código · Comprobar</button>
            </template>
            <p v-else>El código venció. Genera uno nuevo para continuar.</p>
          </div>
        </section>
        <template v-else>
          <section class="card">
            <span class="badge">Número vinculado</span>
            <h2>WhatsApp {{ profile.phone }}</h2>
            <p>
              Escribe <strong>FACTURAS</strong> para consultar tus últimas facturas y el saldo pendiente, o <strong>CONSUMO</strong> para
              ver tus períodos facturados.
            </p>
            <p class="hint">
              Vinculación válida hasta {{ new Date(profile.expiresAt!).toLocaleDateString('es-CO') }}. Puedes retirarla en cualquier
              momento.
            </p>
          </section>
          <section class="card">
            <span class="step">02 · Decide qué recibes</span>
            <h2>Avisos de tus facturas</h2>
            <p>Recibe un aviso cuando se emita una factura, tres días antes de su vencimiento y cuando se confirme un pago.</p>
            <label class="consent"
              ><input v-model="consent" type="checkbox" :disabled="busy || (!profile.notificationsAvailable && !profile.notifications)" />
              <span
                >Quiero recibir estos avisos de WatSolution por WhatsApp en mi número vinculado. Puedo desactivarlos aquí o responder
                <strong>BAJA</strong> en el chat.</span
              ></label
            >
            <p v-if="!profile.notificationsAvailable" class="hint">
              Los avisos están pendientes de habilitación de sus plantillas. Las consultas siguen disponibles.
            </p>
            <button :disabled="busy || consent === profile.notifications" @click="savePreferences">Guardar preferencia</button>
          </section>
          <section class="card compact">
            <h2>Controla el acceso a tu cuenta</h2>
            <p>Si cambias de número o ya no quieres consultar tus datos desde WhatsApp, desvincúlalo.</p>
            <button v-if="!showUnlink" class="secondary" @click="showUnlink = true">Desvincular WhatsApp</button>
            <div v-else>
              <p>Se retirará el acceso desde este chat y se cancelarán los avisos pendientes.</p>
              <button :disabled="busy" @click="unlink">Confirmar desvinculación</button>
              <button class="secondary" :disabled="busy" @click="showUnlink = false">Conservar vinculación</button>
            </div>
          </section>
        </template>
      </template>
    </template>
    <p class="privacy">
      Consulta la <a href="/politica-privacidad">política de privacidad</a> y las
      <a href="/condiciones-del-servicio/">condiciones del servicio</a>. Nunca te pediremos la contraseña del portal por WhatsApp.
    </p>
  </main>
  <footer>© {{ new Date().getFullYear() }} Diego Ocampo y Dylan Rodriguez · WatSolution</footer>
</template>

<style>
:root {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  color: #243d3a;
  background: #f2f6f3;
  line-height: 1.65;
  color-scheme: light;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
a {
  color: #176b55;
  text-underline-offset: 3px;
}
header {
  background: #143e43;
  padding: 22px max(24px, calc((100vw - 1100px) / 2));
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
header a {
  color: #e1f1e8;
  font-size: 14px;
}
.brand {
  font-size: 24px;
  text-decoration: none;
  font-weight: 750;
}
main {
  max-width: 800px;
  margin: 60px auto;
  padding: 0 24px;
}
.eyebrow,
.step {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #557568;
  font-weight: 700;
}
h1 {
  font-size: clamp(30px, 4vw, 43px);
  line-height: 1.2;
  letter-spacing: -1px;
  margin: 16px 0 20px;
  color: #143e43;
}
h2 {
  font-size: 23px;
  line-height: 1.3;
  color: #143e43;
  margin: 10px 0 18px;
}
.intro {
  font-size: 17px;
  max-width: 660px;
  margin-bottom: 32px;
}
.card {
  padding: 32px;
  background: white;
  border: 1px solid #dae7df;
  border-radius: 16px;
  margin: 24px 0;
  box-shadow: 0 8px 28px #143e4305;
}
.compact h2 {
  font-size: 20px;
}
p {
  margin: 0 0 18px;
}
.hint {
  font-size: 13px;
  color: #5a7067;
  margin: 10px 0 18px;
}
label {
  display: block;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}
input[type='tel'] {
  display: block;
  width: min(100%, 380px);
  border: 1px solid #9fb8aa;
  border-radius: 8px;
  font: inherit;
  padding: 12px 14px;
}
button,
.button {
  display: inline-block;
  background: #176b55;
  color: white;
  border: 1px solid #176b55;
  border-radius: 8px;
  padding: 11px 18px;
  font: 600 14px/1.5 system-ui;
  text-decoration: none;
  cursor: pointer;
  margin: 0 10px 8px 0;
}
.secondary {
  background: white;
  color: #176b55;
}
button:disabled {
  opacity: 0.55;
  cursor: default;
}
a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid #bd831e;
  outline-offset: 4px;
}
.code-box {
  background: #edf6ef;
  border: 1px solid #c6e1cf;
  border-radius: 10px;
  padding: 22px;
  margin-top: 22px;
}
.code-box code {
  display: block;
  font-size: clamp(16px, 3.5vw, 22px);
  font-weight: 700;
  overflow-wrap: anywhere;
  margin: 12px 0;
}
.badge {
  display: inline-block;
  background: #e5f4e9;
  color: #176b55;
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 650;
}
.consent {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  line-height: 1.7;
  font-weight: 400;
  margin: 22px 0;
}
.consent input {
  flex-shrink: 0;
  width: 19px;
  height: 19px;
  margin-top: 3px;
  accent-color: #176b55;
}
.alert {
  padding: 16px 20px;
  background: #e0f1e5;
  border-radius: 8px;
  margin: 20px 0;
}
.error {
  background: #ffebe6;
  color: #8f3020;
}
.privacy {
  font-size: 13px;
  color: #5a7067;
  margin-top: 30px;
}
footer {
  border-top: 1px solid #d8e5dc;
  padding: 26px;
  text-align: center;
  font-size: 12px;
  color: #5a7067;
}
@media (max-width: 500px) {
  main {
    margin: 32px auto;
    padding: 0 18px;
  }
  header {
    padding: 18px;
  }
  .brand {
    font-size: 20px;
  }
  header a:last-child {
    font-size: 12px;
  }
  .card {
    padding: 23px;
  }
  .button,
  button {
    max-width: 100%;
  }
}
</style>
