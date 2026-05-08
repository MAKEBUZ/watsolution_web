<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="person">
        <h2 class="jh-entity-heading" data-cy="personDetailsHeading">
          <span v-text="t$('watsolutionApp.person.detail.title')"></span> {{ person.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('watsolutionApp.person.fullName')"></span>
          </dt>
          <dd>
            <span>{{ person.fullName }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.person.documentNumber')"></span>
          </dt>
          <dd>
            <span>{{ person.documentNumber }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.person.phone')"></span>
          </dt>
          <dd>
            <span>{{ person.phone }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.person.email')"></span>
          </dt>
          <dd>
            <span>{{ person.email }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.person.status')"></span>
          </dt>
          <dd>
            <span v-text="t$('watsolutionApp.PersonStatus.' + person.status)"></span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.person.createdAt')"></span>
          </dt>
          <dd>
            <span v-if="person.createdAt">{{ formatDateLong(person.createdAt) }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.person.address')"></span>
          </dt>
          <dd>
            <div v-if="person.address">
              <router-link :to="{ name: 'AddressView', params: { addressId: person.address.id } }">{{ person.address.id }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="person.id" :to="{ name: 'PersonEdit', params: { personId: person.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./person-details.component.ts"></script>
