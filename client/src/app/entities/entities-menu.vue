<template>
  <div>
    <b-dropdown-item to="/address">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.address')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/person">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.person')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/meter">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.meter')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/invoice">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.invoice')"></span>
    </b-dropdown-item>
    <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
  </div>
</template>

<script lang="ts" src="./entities-menu.component.ts"></script>
