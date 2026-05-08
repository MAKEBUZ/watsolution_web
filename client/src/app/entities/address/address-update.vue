<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="watsolutionApp.address.home.createOrEditLabel"
          data-cy="AddressCreateUpdateHeading"
          v-text="t$('watsolutionApp.address.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="address.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="address.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.address.neighborhood')" for="address-neighborhood"></label>
            <input
              type="text"
              class="form-control"
              name="neighborhood"
              id="address-neighborhood"
              data-cy="neighborhood"
              :class="{ valid: !v$.neighborhood.$invalid, invalid: v$.neighborhood.$invalid }"
              v-model="v$.neighborhood.$model"
              required
            />
            <div v-if="v$.neighborhood.$anyDirty && v$.neighborhood.$invalid">
              <small class="form-text text-danger" v-for="error of v$.neighborhood.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.address.street')" for="address-street"></label>
            <input
              type="text"
              class="form-control"
              name="street"
              id="address-street"
              data-cy="street"
              :class="{ valid: !v$.street.$invalid, invalid: v$.street.$invalid }"
              v-model="v$.street.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.address.houseNumber')" for="address-houseNumber"></label>
            <input
              type="text"
              class="form-control"
              name="houseNumber"
              id="address-houseNumber"
              data-cy="houseNumber"
              :class="{ valid: !v$.houseNumber.$invalid, invalid: v$.houseNumber.$invalid }"
              v-model="v$.houseNumber.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.address.city')" for="address-city"></label>
            <input
              type="text"
              class="form-control"
              name="city"
              id="address-city"
              data-cy="city"
              :class="{ valid: !v$.city.$invalid, invalid: v$.city.$invalid }"
              v-model="v$.city.$model"
              required
            />
            <div v-if="v$.city.$anyDirty && v$.city.$invalid">
              <small class="form-text text-danger" v-for="error of v$.city.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.address.latitude')" for="address-latitude"></label>
            <input
              type="number"
              class="form-control"
              name="latitude"
              id="address-latitude"
              data-cy="latitude"
              :class="{ valid: !v$.latitude.$invalid, invalid: v$.latitude.$invalid }"
              v-model.number="v$.latitude.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.address.longitude')" for="address-longitude"></label>
            <input
              type="number"
              class="form-control"
              name="longitude"
              id="address-longitude"
              data-cy="longitude"
              :class="{ valid: !v$.longitude.$invalid, invalid: v$.longitude.$invalid }"
              v-model.number="v$.longitude.$model"
            />
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
<script lang="ts" src="./address-update.component.ts"></script>
