<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="watsolutionApp.person.home.createOrEditLabel"
          data-cy="PersonCreateUpdateHeading"
          v-text="t$('watsolutionApp.person.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="person.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="person.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.person.fullName')" for="person-fullName"></label>
            <input
              type="text"
              class="form-control"
              name="fullName"
              id="person-fullName"
              data-cy="fullName"
              :class="{ valid: !v$.fullName.$invalid, invalid: v$.fullName.$invalid }"
              v-model="v$.fullName.$model"
              required
            />
            <div v-if="v$.fullName.$anyDirty && v$.fullName.$invalid">
              <small class="form-text text-danger" v-for="error of v$.fullName.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.person.documentNumber')" for="person-documentNumber"></label>
            <input
              type="text"
              class="form-control"
              name="documentNumber"
              id="person-documentNumber"
              data-cy="documentNumber"
              :class="{ valid: !v$.documentNumber.$invalid, invalid: v$.documentNumber.$invalid }"
              v-model="v$.documentNumber.$model"
              required
            />
            <div v-if="v$.documentNumber.$anyDirty && v$.documentNumber.$invalid">
              <small class="form-text text-danger" v-for="error of v$.documentNumber.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.person.phone')" for="person-phone"></label>
            <input
              type="text"
              class="form-control"
              name="phone"
              id="person-phone"
              data-cy="phone"
              :class="{ valid: !v$.phone.$invalid, invalid: v$.phone.$invalid }"
              v-model="v$.phone.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.person.email')" for="person-email"></label>
            <input
              type="text"
              class="form-control"
              name="email"
              id="person-email"
              data-cy="email"
              :class="{ valid: !v$.email.$invalid, invalid: v$.email.$invalid }"
              v-model="v$.email.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.person.status')" for="person-status"></label>
            <select
              class="form-control"
              name="status"
              :class="{ valid: !v$.status.$invalid, invalid: v$.status.$invalid }"
              v-model="v$.status.$model"
              id="person-status"
              data-cy="status"
            >
              <option
                v-for="personStatus in personStatusValues"
                :key="personStatus"
                :value="personStatus"
                :label="t$('watsolutionApp.PersonStatus.' + personStatus)"
              >
                {{ personStatus }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('watsolutionApp.person.createdAt')" for="person-createdAt"></label>
            <div class="d-flex">
              <input
                id="person-createdAt"
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
            <label class="form-control-label" v-text="t$('watsolutionApp.person.address')" for="person-address"></label>
            <select class="form-control" id="person-address" data-cy="address" name="address" v-model="person.address">
              <option :value="null"></option>
              <option
                :value="person.address && addressOption.id === person.address.id ? person.address : addressOption"
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
<script lang="ts" src="./person-update.component.ts"></script>
