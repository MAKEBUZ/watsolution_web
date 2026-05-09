<template>
  <div id="app">
    <ribbon></ribbon>
    <div id="app-header" v-if="!isAdminPanel">
      <jhi-navbar></jhi-navbar>
    </div>
    <div class="container-fluid" :class="isAdminPanel ? 'p-0' : ''">
      <div :class="isAdminPanel ? '' : 'card jh-card'">
        <router-view></router-view>
      </div>
      <jhi-footer v-if="!isAdminPanel"></jhi-footer>
    </div>
  </div>
</template>

<script lang="ts" src="./app.component.ts"></script>
