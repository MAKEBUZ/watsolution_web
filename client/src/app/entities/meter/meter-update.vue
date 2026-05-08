<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="watsolutionApp.meter.home.createOrEditLabel"
          data-cy="MeterCreateUpdateHeading"
          v-text="t$('watsolutionApp.meter.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="meter.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="meter.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.meter.waterMeasure')" for="meter-waterMeasure"></label>
            <input
              type="number"
              class="form-control"
              name="waterMeasure"
              id="meter-waterMeasure"
              data-cy="waterMeasure"
              :class="{ valid: !v$.waterMeasure.$invalid, invalid: v$.waterMeasure.$invalid }"
              v-model.number="v$.waterMeasure.$model"
              required
            />
            <div v-if="v$.waterMeasure.$anyDirty && v$.waterMeasure.$invalid">
              <small class="form-text text-danger" v-for="error of v$.waterMeasure.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.meter.readingDate')" for="meter-readingDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="meter-readingDate"
                  v-model="v$.readingDate.$model"
                  name="readingDate"
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
                id="meter-readingDate"
                data-cy="readingDate"
                type="text"
                class="form-control"
                name="readingDate"
                :class="{ valid: !v$.readingDate.$invalid, invalid: v$.readingDate.$invalid }"
                v-model="v$.readingDate.$model"
                required
              />
            </b-input-group>
            <div v-if="v$.readingDate.$anyDirty && v$.readingDate.$invalid">
              <small class="form-text text-danger" v-for="error of v$.readingDate.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.meter.observation')" for="meter-observation"></label>
            <input
              type="text"
              class="form-control"
              name="observation"
              id="meter-observation"
              data-cy="observation"
              :class="{ valid: !v$.observation.$invalid, invalid: v$.observation.$invalid }"
              v-model="v$.observation.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.meter.createdAt')" for="meter-createdAt"></label>
            <div class="d-flex">
              <input
                id="meter-createdAt"
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
            <label class="form-control-label" v-text="t$('watsolutionApp.meter.person')" for="meter-person"></label>
            <select class="form-control" id="meter-person" data-cy="person" name="person" v-model="meter.person">
              <option :value="null"></option>
              <option
                :value="meter.person && personOption.id === meter.person.id ? meter.person : personOption"
                v-for="personOption in people"
                :key="personOption.id"
              >
                {{ personOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.meter.address')" for="meter-address"></label>
            <select class="form-control" id="meter-address" data-cy="address" name="address" v-model="meter.address">
              <option :value="null"></option>
              <option
                :value="meter.address && addressOption.id === meter.address.id ? meter.address : addressOption"
                v-for="addressOption in addresses"
                :key="addressOption.id"
              >
                {{ addressOption.id }}
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
<script lang="ts" src="./meter-update.component.ts"></script>
