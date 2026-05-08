<template>
  <nav class="navbar navbar-expand-md navbar-dark wat-navbar">
    <!-- Brand -->
    <router-link class="navbar-brand d-flex align-items-center" to="/">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
        <path d="M16 4C16 4 6 14 6 20C6 25.5228 10.4772 30 16 30C21.5228 30 26 25.5228 26 20C26 14 16 4Z" fill="#38bdf8"/>
        <path d="M16 10C16 10 10 17 10 21C10 24.3137 12.6863 27 16 27C19.3137 27 22 24.3137 22 21C22 17 16 10Z" fill="#bae6fd"/>
      </svg>
      <span class="brand-text"><strong>Wat</strong>Solution</span>
    </router-link>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#wat-nav-collapse"
      aria-controls="wat-nav-collapse" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="wat-nav-collapse">
      <!-- Center links -->
      <ul class="navbar-nav mx-auto">
        <li class="nav-item">
          <router-link class="nav-link" to="/" exact>Inicio</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/noticias">Noticias</router-link>
        </li>
        <li class="nav-item" v-if="authenticated">
          <router-link class="nav-link" to="/portal">Portal Usuario</router-link>
        </li>
        <li class="nav-item" v-if="authenticated">
          <router-link class="nav-link" to="/pagos">Pagos</router-link>
        </li>
        <li class="nav-item" v-if="hasAnyAuthority('ROLE_ADMIN') && authenticated">
          <router-link class="nav-link" to="/admin-panel">Admin</router-link>
        </li>
      </ul>

      <!-- Right controls -->
      <ul class="navbar-nav ml-auto align-items-center">
        <li class="nav-item" v-if="!authenticated">
          <a class="nav-link" href="javascript:void(0);" @click="openLogin()">Iniciar Sesión</a>
        </li>
        <li class="nav-item" v-if="!authenticated">
          <router-link class="nav-link" to="/register">Registrarse</router-link>
        </li>
        <li class="nav-item" v-if="authenticated">
          <b-nav-item-dropdown right id="account-menu" class="pointer" data-cy="accountMenu">
            <template #button-content>
              <span class="user-avatar mr-1">{{ userInitials }}</span>
              <span class="d-none d-md-inline">{{ currentUsername }}</span>
            </template>
            <b-dropdown-item to="/account/settings" active-class="active">
              <font-awesome-icon icon="wrench" /> Configuración
            </b-dropdown-item>
            <b-dropdown-item to="/account/password" active-class="active">
              <font-awesome-icon icon="lock" /> Contraseña
            </b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item @click="logout()" id="logout" active-class="active">
              <font-awesome-icon icon="sign-out-alt" /> Cerrar Sesión
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </li>
        <li class="nav-item" v-if="authenticated">
          <button class="btn btn-outline-light btn-sm ml-2" @click="logout()">Cerrar Sesión</button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts" src="./jhi-navbar.component.ts"></script>

<style scoped>
.wat-navbar {
  background-color: #1a3a5c !important;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.brand-text {
  font-size: 1.25rem;
  color: white;
  letter-spacing: -0.5px;
}

.wat-navbar .nav-link {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: color 0.2s;
}

.wat-navbar .nav-link:hover,
.wat-navbar .nav-link.router-link-active {
  color: #38bdf8 !important;
}

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
}
</style>
