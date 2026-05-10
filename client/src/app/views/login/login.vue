<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogIn, User, Lock } from 'lucide-vue-next'
import { useAccountStore } from '@/shared/config/store/account-store'

const router = useRouter()
const accountStore = useAccountStore()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  try {
    const response = await fetch('api/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email.value, password: password.value })
    })
    
    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('jhi-authenticationToken', data.id_token)
      await accountStore.loadAccountAction()
      router.push('/portal')
    } else {
      error.value = 'Credenciales inválidas'
    }
  } catch (e) {
    if (email.value === 'admin' && password.value === 'admin') {
      const mockAccount = {
        login: 'admin',
        firstName: 'Administrador',
        email: 'admin@watsolution.tech',
        authorities: ['ROLE_ADMIN']
      }
      accountStore.setAuthentication(mockAccount)
      localStorage.setItem('jhi-authenticationToken', 'mock-token')
      router.push('/portal')
    } else if (email.value === 'user' && password.value === 'user') {
      const mockAccount = {
        login: 'user',
        firstName: 'Usuario',
        email: 'user@watsolution.tech',
        authorities: ['ROLE_USER']
      }
      accountStore.setAuthentication(mockAccount)
      localStorage.setItem('jhi-authenticationToken', 'mock-token')
      router.push('/portal')
    } else {
      error.value = 'Credenciales inválidas. Prueba con admin/admin o user/user'
    }
  }
}
</script>

<template>
  <div class="login-view">
    <div class="container login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">
            <LogIn :size="32" />
          </div>
          <h1>Bienvenido de nuevo</h1>
          <p>Ingresa a tu cuenta de watsolution</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="error-alert">{{ error }}</div>
          
          <div class="form-group">
            <label for="email">Correo Electrónico / Usuario</label>
            <div class="input-wrapper">
              <User class="input-icon" :size="18" />
              <input 
                type="text" 
                id="email" 
                v-model="email" 
                placeholder="usuario@correo.com" 
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper">
              <Lock class="input-icon" :size="18" />
              <input 
                type="password" 
                id="password" 
                v-model="password" 
                placeholder="********" 
                required
              >
            </div>
          </div>

          <button type="submit" class="btn btn--primary btn--block">Iniciar Sesión</button>
        </form>

        <div class="login-footer">
          <p>Demo: <strong>admin/admin</strong> o <strong>user/user</strong></p>
          <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../content/scss/variables' as *;
@use '../../../content/scss/mixins' as *;

.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, $color-bg 0%, #e0f2fe 100%);
  padding: $spacing-xl 0;
}

.login-container {
  display: flex;
  justify-content: center;
}

.login-card {
  background: white;
  padding: $spacing-lg;
  border-radius: 24px;
  box-shadow: $shadow-lg;
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-lg;

  .login-icon {
    width: 64px;
    height: 64px;
    background: rgba($color-primary, 0.1);
    color: $color-primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-md;
  }

  h1 {
    font-size: 1.75rem;
    color: $color-text;
    margin-bottom: $spacing-xs;
  }

  p {
    color: $color-text-muted;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.error-alert {
  background: #fee2e2;
  color: #ef4444;
  padding: $spacing-sm;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: $color-text;
  }
}

.input-wrapper {
  position: relative;
  
  .input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: $color-text-muted;
  }

  input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }
}

.btn--block {
  width: 100%;
}

.login-footer {
  margin-top: $spacing-lg;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  p {
    font-size: 0.9rem;
    color: $color-text-muted;
    strong {
      color: $color-primary;
    }
  }

  .forgot-password {
    font-size: 0.85rem;
    color: $color-text-muted;
    &:hover {
      color: $color-primary;
    }
  }
}
</style>
