<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="invoice">
        <h2 class="jh-entity-heading" data-cy="invoiceDetailsHeading">
          <span v-text="t$('watsolutionApp.invoice.detail.title')"></span> {{ invoice.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('watsolutionApp.invoice.issueDate')"></span>
          </dt>
          <dd>
            <span>{{ invoice.issueDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.invoice.dueDate')"></span>
          </dt>
          <dd>
            <span>{{ invoice.dueDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.invoice.consumptionM3')"></span>
          </dt>
          <dd>
            <span>{{ invoice.consumptionM3 }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.invoice.amountDue')"></span>
          </dt>
          <dd>
            <span>{{ invoice.amountDue }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.invoice.status')"></span>
          </dt>
          <dd>
            <span v-text="t$('watsolutionApp.InvoiceStatus.' + invoice.status)"></span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.invoice.createdAt')"></span>
          </dt>
          <dd>
            <span v-if="invoice.createdAt">{{ formatDateLong(invoice.createdAt) }}</span>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.invoice.meter')"></span>
          </dt>
          <dd>
            <div v-if="invoice.meter">
              <router-link :to="{ name: 'MeterView', params: { meterId: invoice.meter.id } }">{{ invoice.meter.id }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('watsolutionApp.invoice.person')"></span>
          </dt>
          <dd>
            <div v-if="invoice.person">
              <router-link :to="{ name: 'PersonView', params: { personId: invoice.person.id } }">{{ invoice.person.id }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="invoice.id" :to="{ name: 'InvoiceEdit', params: { invoiceId: invoice.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./invoice-details.component.ts"></script>
