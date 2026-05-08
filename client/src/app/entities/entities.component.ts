import { defineComponent, provide } from 'vue';

import AddressService from './address/address.service';
import PersonService from './person/person.service';
import MeterService from './meter/meter.service';
import InvoiceService from './invoice/invoice.service';
import UserService from '@/entities/user/user.service';
// jhipster-needle-add-entity-service-to-entities-component-import - JHipster will import entities services here

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Entities',
  setup() {
    provide('userService', () => new UserService());
    provide('addressService', () => new AddressService());
    provide('personService', () => new PersonService());
    provide('meterService', () => new MeterService());
    provide('invoiceService', () => new InvoiceService());
    // jhipster-needle-add-entity-service-to-entities-component - JHipster will import entities services here
  },
});
