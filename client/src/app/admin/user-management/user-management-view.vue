<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="user">
        <h2 class="jh-entity-heading">
          <span v-text="t$('userManagement.detail.title')"></span> [<strong>{{ user.login }}</strong
          >]
        </h2>
        <dl class="row jh-entity-details">
          <dt><span v-text="t$('userManagement.login')"></span></dt>
          <dd>
            <span>{{ user.login }}</span>
            <b-badge variant="success" v-if="user.activated" v-text="t$('userManagement.activated')"></b-badge>
            <b-badge variant="danger" v-if="!user.activated" v-text="t$('userManagement.deactivated')"></b-badge>
          </dd>
          <dt><span v-text="t$('userManagement.firstName')"></span></dt>
          <dd>{{ user.firstName }}</dd>
          <dt><span v-text="t$('userManagement.lastName')"></span></dt>
          <dd>{{ user.lastName }}</dd>
          <dt><span v-text="t$('userManagement.email')"></span></dt>
          <dd>{{ user.email }}</dd>
          <dt><span v-text="t$('userManagement.langKey')"></span></dt>
          <dd>{{ user.langKey }}</dd>
          <dt><span v-text="t$('userManagement.createdBy')"></span></dt>
          <dd>{{ user.createdBy }}</dd>
          <dt><span v-text="t$('userManagement.createdDate')"></span></dt>
          <dd>
            <span v-if="user.createdDate">
              {{ formatDate(user.createdDate) }}
            </span>
          </dd>
          <dt><span v-text="t$('userManagement.lastModifiedBy')"></span></dt>
          <dd>{{ user.lastModifiedBy }}</dd>
          <dt><span v-text="t$('userManagement.lastModifiedDate')"></span></dt>
          <dd>
            <span v-if="user.lastModifiedDate">
              {{ formatDate(user.lastModifiedDate) }}
            </span>
          </dd>
          <dt><span v-text="t$('userManagement.profiles')"></span></dt>
          <dd>
            <ul class="list-unstyled">
              <li v-for="authority of user.authorities" :key="authority">
                <b-badge variant="info">{{ authority }}</b-badge>
              </li>
            </ul>
          </dd>
        </dl>
        <section class="card p-3 mb-3">
          <h3>Invitación o recuperación de acceso</h3>
          <p>Verifica primero la identidad del titular. El enlace permite elegir una contraseña y activa cuentas nuevas.</p>
          <label for="recovery-password">Tu contraseña de administrador</label>
          <input
            id="recovery-password"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            class="form-control mb-2"
          />
          <button type="button" class="btn btn-primary" :disabled="issuing || !currentPassword" @click="issueRecovery">
            Generar enlace privado
          </button>
          <p role="status">{{ recoveryMessage }}</p>
          <textarea v-if="recoveryLink" :value="recoveryLink" readonly class="form-control" aria-label="Enlace privado de recuperación" />
        </section>
        <router-link custom v-slot="{ navigate }" :to="{ name: 'JhiUser' }">
          <button @click="navigate" class="btn btn-info">
            <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./user-management-view.component.ts"></script>
