<template>
  <div>
    <h2 id="page-heading" data-cy="InvoiceHeading">
      <span v-text="t$('watsolutionApp.invoice.home.title')" id="invoice-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('watsolutionApp.invoice.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'InvoiceCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-invoice"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('watsolutionApp.invoice.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && invoices && invoices.length === 0">
      <span v-text="t$('watsolutionApp.invoice.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="invoices && invoices.length > 0">
      <table class="table table-striped" aria-describedby="invoices">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('id')">
              <span v-text="t$('global.field.id')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('issueDate')">
              <span v-text="t$('watsolutionApp.invoice.issueDate')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'issueDate'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('dueDate')">
              <span v-text="t$('watsolutionApp.invoice.dueDate')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'dueDate'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('consumptionM3')">
              <span v-text="t$('watsolutionApp.invoice.consumptionM3')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'consumptionM3'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('amountDue')">
              <span v-text="t$('watsolutionApp.invoice.amountDue')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'amountDue'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('status')">
              <span v-text="t$('watsolutionApp.invoice.status')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'status'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('createdAt')">
              <span v-text="t$('watsolutionApp.invoice.createdAt')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'createdAt'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('meter.id')">
              <span v-text="t$('watsolutionApp.invoice.meter')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'meter.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('person.id')">
              <span v-text="t$('watsolutionApp.invoice.person')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'person.id'"></jhi-sort-indicator>
            </th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'InvoiceView', params: { invoiceId: invoice.id } }">{{ invoice.id }}</router-link>
            </td>
            <td>{{ invoice.issueDate }}</td>
            <td>{{ invoice.dueDate }}</td>
            <td>{{ invoice.consumptionM3 }}</td>
            <td>{{ invoice.amountDue }}</td>
            <td v-text="t$('watsolutionApp.InvoiceStatus.' + invoice.status)"></td>
            <td>{{ formatDateShort(invoice.createdAt) || '' }}</td>
            <td>
              <div v-if="invoice.meter">
                <router-link :to="{ name: 'MeterView', params: { meterId: invoice.meter.id } }">{{ invoice.meter.id }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="invoice.person">
                <router-link :to="{ name: 'PersonView', params: { personId: invoice.person.id } }">{{ invoice.person.id }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'InvoiceView', params: { invoiceId: invoice.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'InvoiceEdit', params: { invoiceId: invoice.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(invoice)"
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
      </table>
    </div>
    <b-modal ref="removeEntity" id="removeEntity">
      <template #modal-title>
        <span id="watsolutionApp.invoice.delete.question" data-cy="invoiceDeleteDialogHeading" v-text="t$('entity.delete.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-invoice-heading" v-text="t$('watsolutionApp.invoice.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-invoice"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeInvoice()"
          ></button>
        </div>
      </template>
    </b-modal>
    <div v-show="invoices && invoices.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./invoice.component.ts"></script>
