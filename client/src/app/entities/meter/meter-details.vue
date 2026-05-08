<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="meter">
        <h2 class="jh-entity-heading" data-cy="meterDetailsHeading">
          <span v-text="t$('watsolutionApp.meter.detail.title')"></span> {{ meter.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('watsolutionApp.meter.waterMeasure')"></span>
          </dt>
          <dd>
            <span>{{ meter.waterMeasure }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.meter.readingDate')"></span>
          </dt>
          <dd>
            <span>{{ meter.readingDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.meter.observation')"></span>
          </dt>
          <dd>
            <span>{{ meter.observation }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.meter.createdAt')"></span>
          </dt>
          <dd>
            <span v-if="meter.createdAt">{{ formatDateLong(meter.createdAt) }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.meter.person')"></span>
          </dt>
          <dd>
            <div v-if="meter.person">
              <router-link :to="{ name: 'PersonView', params: { personId: meter.person.id } }">{{ meter.person.id }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.meter.address')"></span>
          </dt>
          <dd>
            <div v-if="meter.address">
              <router-link :to="{ name: 'AddressView', params: { addressId: meter.address.id } }">{{ meter.address.id }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="meter.id" :to="{ name: 'MeterEdit', params: { meterId: meter.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./meter-details.component.ts"></script>
