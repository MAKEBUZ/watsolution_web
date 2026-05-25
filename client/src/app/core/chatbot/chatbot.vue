<script setup lang="ts">
import { ref, computed, inject, nextTick, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const authenticated = inject<ComputedRef<boolean>>('authenticated')

const open = ref(false)
const input = ref('')
const loading = ref(false)
const messagesEl = ref<HTMLElement | null>(null)

type Msg = { role: 'user' | 'bot'; text: string }
const messages = ref<Msg[]>([
  { role: 'bot', text: '¡Hola! Soy el asistente de WatSolution. ¿En qué te puedo ayudar con tus facturas o pagos?' },
])

const hidden = computed(() =>
  !authenticated?.value || route.path.startsWith('/pagos'),
)

const toggle = () => { open.value = !open.value }

const scrollBottom = async () => {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

const send = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return
  input.value = ''
  messages.value.push({ role: 'user', text })
  await scrollBottom()
  loading.value = true
  try {
    const { data } = await axios.post<{ reply: string }>('api/ai/chat', { message: text })
    messages.value.push({ role: 'bot', text: data.reply })
  } catch {
    messages.value.push({ role: 'bot', text: 'Ocurrió un error. Intenta de nuevo.' })
  } finally {
    loading.value = false
    await scrollBottom()
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
}
</script>

<template>
  <div v-if="!hidden" class="cb-root">
    <!-- Panel -->
    <div v-if="open" class="cb-panel">
      <div class="cb-header">
        <div class="cb-header__info">
          <div class="cb-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z"/></svg>
          </div>
          <div>
            <p class="cb-header__name">Asistente WatSolution</p>
            <p class="cb-header__status">En línea</p>
          </div>
        </div>
        <button class="cb-close" @click="toggle" aria-label="Cerrar chat">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="cb-messages" ref="messagesEl">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['cb-msg', msg.role === 'user' ? 'cb-msg--user' : 'cb-msg--bot']"
        >
          <div v-if="msg.role === 'bot'" class="cb-msg__avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z"/></svg>
          </div>
          <p class="cb-msg__bubble">{{ msg.text }}</p>
        </div>

        <div v-if="loading" class="cb-msg cb-msg--bot">
          <div class="cb-msg__avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z"/></svg>
          </div>
          <div class="cb-msg__bubble cb-typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <div class="cb-input-row">
        <textarea
          v-model="input"
          class="cb-input"
          placeholder="Escribe tu pregunta..."
          rows="1"
          @keydown="onKeydown"
        ></textarea>
        <button class="cb-send" :disabled="!input.trim() || loading" @click="send" aria-label="Enviar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>

    <!-- Trigger button -->
    <button class="cb-trigger" @click="toggle" aria-label="Abrir asistente">
      <svg v-if="!open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
    </button>
  </div>
</template>

<style scoped>
.cb-root {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

/* ── Trigger ──────────────────────────────────────────────────────────────── */
.cb-trigger {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #0077be;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 119, 190, 0.45);
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
}
.cb-trigger:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0, 119, 190, 0.55);
}

/* ── Panel ────────────────────────────────────────────────────────────────── */
.cb-panel {
  width: 340px;
  max-height: 480px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cb-slide-up 0.2s ease;
}

@keyframes cb-slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.cb-header {
  background: #0077be;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cb-header__info { display: flex; align-items: center; gap: 10px; }
.cb-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.cb-header__name { font-size: 0.9rem; font-weight: 700; color: white; margin: 0; }
.cb-header__status { font-size: 0.72rem; color: rgba(255,255,255,0.8); margin: 0; }
.cb-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.8;
  padding: 2px;
  display: flex;
}
.cb-close:hover { opacity: 1; }

/* ── Messages ─────────────────────────────────────────────────────────────── */
.cb-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  max-height: 340px;
}

.cb-msg {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}
.cb-msg--user { flex-direction: row-reverse; }

.cb-msg__avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0f0ff;
  color: #0077be;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cb-msg__bubble {
  max-width: 75%;
  padding: 9px 13px;
  border-radius: 16px;
  font-size: 0.85rem;
  line-height: 1.45;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.cb-msg--bot .cb-msg__bubble {
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 4px;
}
.cb-msg--user .cb-msg__bubble {
  background: #0077be;
  color: white;
  border-bottom-right-radius: 4px;
}

/* typing indicator */
.cb-typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 12px 16px;
}
.cb-typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
  animation: cb-bounce 1.2s infinite ease-in-out;
}
.cb-typing span:nth-child(2) { animation-delay: 0.2s; }
.cb-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes cb-bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40%            { transform: scale(1.1); opacity: 1; }
}

/* ── Input ────────────────────────────────────────────────────────────────── */
.cb-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid #f1f5f9;
}
.cb-input {
  flex: 1;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 9px 12px;
  font-size: 0.85rem;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.4;
  transition: border-color 0.2s;
  max-height: 80px;
  overflow-y: auto;
}
.cb-input:focus { border-color: #0077be; }
.cb-send {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #0077be;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.cb-send:hover:not(:disabled) { background: #005f99; }
.cb-send:disabled { background: #cbd5e1; cursor: not-allowed; }
</style>
