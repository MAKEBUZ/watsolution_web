<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4C16 4 6 14 6 20C6 25.5228 10.4772 30 16 30C21.5228 30 26 25.5228 26 20C26 14 16 4Z" fill="#38bdf8"/>
          <path d="M16 10C16 10 10 17 10 21C10 24.3137 12.6863 27 16 27C19.3137 27 22 24.3137 22 21C22 17 16 10Z" fill="#bae6fd"/>
        </svg>
        <h1 class="login-brand"><strong>Wat</strong>Solution</h1>
        <p class="login-subtitle">Sistema de Gestión de Agua</p>
      </div>

      <!-- Error alert -->
      <div v-if="authError" class="login-error">
        <font-awesome-icon icon="exclamation-circle" class="mr-2" />
        Usuario o contraseña incorrectos. Intente de nuevo.
      </div>

      <!-- Form -->
      <form @submit.prevent="doLogin" novalidate>
        <div class="login-field">
          <label for="username">Usuario</label>
          <div class="input-wrap">
            <font-awesome-icon icon="user" class="input-icon" />
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Ingrese su usuario"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <div class="login-field">
          <label for="password">Contraseña</label>
          <div class="input-wrap">
            <font-awesome-icon icon="lock" class="input-icon" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Ingrese su contraseña"
              autocomplete="current-password"
              required
            />
          </div>
        </div>

        <div class="login-remember">
          <label class="remember-label">
            <input type="checkbox" v-model="rememberMe" />
            <span>Recordarme</span>
          </label>
          <router-link to="/account/reset/request" class="forgot-link">¿Olvidó su contraseña?</router-link>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">
            <font-awesome-icon icon="spinner" spin /> Ingresando...
          </span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <p class="login-register">
        ¿No tiene cuenta?
        <router-link to="/register">Regístrese aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts" src="./login.component.ts"></script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f2744 0%, #1a3a5c 60%, #1e4976 100%);
  padding: 1rem;
}

.login-card {
  background: #fff;
  border-radius: 18px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-logo {
  text-align: center;
  margin-bottom: 1.75rem;
}

.login-brand {
  font-size: 1.75rem;
  color: #1a3a5c;
  margin: 0.5rem 0 0.25rem;
  letter-spacing: -0.5px;
}

.login-brand strong {
  color: #0ea5e9;
}

.login-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.login-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.login-field {
  margin-bottom: 1.25rem;
}

.login-field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.4rem;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.875rem;
}

.input-wrap input {
  width: 100%;
  padding: 0.65rem 0.875rem 0.65rem 2.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-wrap input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.login-remember {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #475569;
  cursor: pointer;
  margin: 0;
}

.remember-label input[type="checkbox"] {
  accent-color: #0ea5e9;
}

.forgot-link {
  color: #0ea5e9;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-login:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-register {
  text-align: center;
  margin-top: 1.25rem;
  margin-bottom: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.login-register a {
  color: #0ea5e9;
  font-weight: 600;
  text-decoration: none;
}

.login-register a:hover {
  text-decoration: underline;
}
</style>
