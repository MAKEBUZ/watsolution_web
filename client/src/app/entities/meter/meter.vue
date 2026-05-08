<template>
  <div>
    <h2 id="page-heading" data-cy="MeterHeading">
      <span v-text="t$('watsolutionApp.meter.home.title')" id="meter-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('watsolutionApp.meter.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'MeterCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-meter"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('watsolutionApp.meter.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && meters && meters.length === 0">
      <span v-text="t$('watsolutionApp.meter.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="meters && meters.length > 0">
      <table class="table table-striped" aria-describedby="meters">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('id')">
              <span v-text="t$('global.field.id')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('waterMeasure')">
              <span v-text="t$('watsolutionApp.meter.waterMeasure')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'waterMeasure'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('readingDate')">
              <span v-text="t$('watsolutionApp.meter.readingDate')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'readingDate'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('observation')">
              <span v-text="t$('watsolutionApp.meter.observation')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'observation'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('createdAt')">
              <span v-text="t$('watsolutionApp.meter.createdAt')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'createdAt'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('person.id')">
              <span v-text="t$('watsolutionApp.meter.person')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'person.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('address.id')">
              <span v-text="t$('watsolutionApp.meter.address')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'address.id'"></jhi-sort-indicator>
            </th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="meter in meters" :key="meter.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'MeterView', params: { meterId: meter.id } }">{{ meter.id }}</router-link>
            </td>
            <td>{{ meter.waterMeasure }}</td>
            <td>{{ meter.readingDate }}</td>
            <td>{{ meter.observation }}</td>
            <td>{{ formatDateShort(meter.createdAt) || '' }}</td>
            <td>
              <div v-if="meter.person">
                <router-link :to="{ name: 'PersonView', params: { personId: meter.person.id } }">{{ meter.person.id }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="meter.address">
                <router-link :to="{ name: 'AddressView', params: { addressId: meter.address.id } }">{{ meter.address.id }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'MeterView', params: { meterId: meter.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'MeterEdit', params: { meterId: meter.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(meter)"
                  variant="danger"
                  class="btn btn-sm"
                  data-cy="entityDeleteButton"
                  v-b-modal.removeEntity
                >
                  <font-awesome-icon icon="times"></font-awesome-icon>
                  <span class="d-none d-md-inline" v-text="t$('entity.action.delete')"></span>
                </b-button>
              </div>
            </td>
          </tr>
        </tbody>
        <span ref="infiniteScrollEl"></span>
      </table>
    </div>
    <b-modal ref="removeEntity" id="removeEntity">
      <template #modal-title>
        <span id="watsolutionApp.meter.delete.question" data-cy="meterDeleteDialogHeading" v-text="t$('entity.delete.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-meter-heading" v-text="t$('watsolutionApp.meter.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-meter"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeMeter()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./meter.component.ts"></script>
