<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="watsolutionApp.invoice.home.createOrEditLabel"
          data-cy="InvoiceCreateUpdateHeading"
          v-text="t$('watsolutionApp.invoice.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="invoice.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="invoice.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.invoice.issueDate')" for="invoice-issueDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="invoice-issueDate"
                  v-model="v$.issueDate.$model"
                  name="issueDate"
                  class="form-control"
                  :locale="currentLanguage"
                  button-only
                  today-button
                  reset-button
                  close-button
                >
                </b-form-datepicker>
              </b-input-group-prepend>
              <b-form-input
                id="invoice-issueDate"
                data-cy="issueDate"
                type="text"
                class="form-control"
                name="issueDate"
                :class="{ valid: !v$.issueDate.$invalid, invalid: v$.issueDate.$invalid }"
                v-model="v$.issueDate.$model"
                required
              />
            </b-input-group>
            <div v-if="v$.issueDate.$anyDirty && v$.issueDate.$invalid">
              <small class="form-text text-danger" v-for="error of v$.issueDate.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.invoice.dueDate')" for="invoice-dueDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="invoice-dueDate"
                  v-model="v$.dueDate.$model"
                  name="dueDate"
                  class="form-control"
                  :locale="currentLanguage"
                  button-only
                  today-button
                  reset-button
                  close-button
                >
                </b-form-datepicker>
              </b-input-group-prepend>
              <b-form-input
                id="invoice-dueDate"
                data-cy="dueDate"
                type="text"
                class="form-control"
                name="dueDate"
                :class="{ valid: !v$.dueDate.$invalid, invalid: v$.dueDate.$invalid }"
                v-model="v$.dueDate.$model"
                required
              />
            </b-input-group>
            <div v-if="v$.dueDate.$anyDirty && v$.dueDate.$invalid">
              <small class="form-text text-danger" v-for="error of v$.dueDate.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.invoice.consumptionM3')" for="invoice-consumptionM3"></label>
            <input
              type="number"
              class="form-control"
              name="consumptionM3"
              id="invoice-consumptionM3"
              data-cy="consumptionM3"
              :class="{ valid: !v$.consumptionM3.$invalid, invalid: v$.consumptionM3.$invalid }"
              v-model.number="v$.consumptionM3.$model"
              required
            />
            <div v-if="v$.consumptionM3.$anyDirty && v$.consumptionM3.$invalid">
              <small class="form-text text-danger" v-for="error of v$.consumptionM3.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.invoice.amountDue')" for="invoice-amountDue"></label>
            <input
              type="number"
              class="form-control"
              name="amountDue"
              id="invoice-amountDue"
              data-cy="amountDue"
              :class="{ valid: !v$.amountDue.$invalid, invalid: v$.amountDue.$invalid }"
              v-model.number="v$.amountDue.$model"
              required
            />
            <div v-if="v$.amountDue.$anyDirty && v$.amountDue.$invalid">
              <small class="form-text text-danger" v-for="error of v$.amountDue.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.invoice.status')" for="invoice-status"></label>
            <select
              class="form-control"
              name="status"
              :class="{ valid: !v$.status.$invalid, invalid: v$.status.$invalid }"
              v-model="v$.status.$model"
              id="invoice-status"
              data-cy="status"
            >
              <option
                v-for="invoiceStatus in invoiceStatusValues"
                :key="invoiceStatus"
                :value="invoiceStatus"
                :label="t$('watsolutionApp.InvoiceStatus.' + invoiceStatus)"
              >
                {{ invoiceStatus }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.invoice.createdAt')" for="invoice-createdAt"></label>
            <div class="d-flex">
              <input
                id="invoice-createdAt"
                data-cy="createdAt"
                type="datetime-local"
                class="form-control"
                name="createdAt"
                :class="{ valid: !v$.createdAt.$invalid, invalid: v$.createdAt.$invalid }"
                :value="convertDateTimeFromServer(v$.createdAt.$model)"
                @change="updateInstantField('createdAt', $event)"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.invoice.meter')" for="invoice-meter"></label>
            <select class="form-control" id="invoice-meter" data-cy="meter" name="meter" v-model="invoice.meter">
              <option :value="null"></option>
              <option
                :value="invoice.meter && meterOption.id === invoice.meter.id ? invoice.meter : meterOption"
                v-for="meterOption in meters"
                :key="meterOption.id"
              >
                {{ meterOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.invoice.person')" for="invoice-person"></label>
            <select class="form-control" id="invoice-person" data-cy="person" name="person" v-model="invoice.person">
              <option :value="null"></option>
              <option
                :value="invoice.person && personOption.id === invoice.person.id ? invoice.person : personOption"
                v-for="personOption in people"
                :key="personOption.id"
              >
                {{ personOption.id }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" @click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="v$.$invalid || isSaving"
            class="btn btn-primary"
          >
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" src="./invoice-update.component.ts"></script>
