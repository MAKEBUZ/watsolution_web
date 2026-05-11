<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/shared/config/store/account-store'

const router = useRouter()
const accountStore = useAccountStore()

const handleLogout = () => {
  accountStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="user-portal">
    <div class="portal-container">
      <h1>Portal de Usuario</h1>
      <p>Bienvenido, {{ accountStore.account?.firstName || 'Usuario' }}</p>
      <div class="portal-actions">
        <button class="portal-btn" @click="router.push('/portal')">
          Ir al Dashboard
        </button>
        <button class="portal-btn logout" @click="handleLogout">
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-portal {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 2rem;
}

.portal-container {
  text-align: center;
  max-width: 600px;
  width: 100%;

  h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 2rem;
  }
}

.portal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.portal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: #0077be;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #005fa3;
    transform: translateY(-1px);
  }

  &.logout {
    background: #ef4444;

    &:hover {
      background: #dc2626;
    }
  }
}
</style>
