<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="address">
        <h2 class="jh-entity-heading" data-cy="addressDetailsHeading">
          <span v-text="t$('watsolutionApp.address.detail.title')"></span> {{ address.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('watsolutionApp.address.neighborhood')"></span>
          </dt>
          <dd>
            <span>{{ address.neighborhood }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.address.street')"></span>
          </dt>
          <dd>
            <span>{{ address.street }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.address.houseNumber')"></span>
          </dt>
          <dd>
            <span>{{ address.houseNumber }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.address.city')"></span>
          </dt>
          <dd>
            <span>{{ address.city }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.address.latitude')"></span>
          </dt>
          <dd>
            <span>{{ address.latitude }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.address.longitude')"></span>
          </dt>
          <dd>
            <span>{{ address.longitude }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="address.id" :to="{ name: 'AddressEdit', params: { addressId: address.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./address-details.component.ts"></script>
