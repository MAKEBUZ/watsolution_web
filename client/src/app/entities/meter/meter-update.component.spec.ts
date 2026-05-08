import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import dayjs from 'dayjs';
import MeterUpdate from './meter-update.vue';
import MeterService from './meter.service';
import { DATE_TIME_LONG_FORMAT } from '@/shared/composables/date-format';
import AlertService from '@/shared/alert/alert.service';

import PersonService from '@/entities/person/person.service';
import AddressService from '@/entities/address/address.service';

type MeterUpdateComponentType = InstanceType<typeof MeterUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const meterSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<MeterUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Meter Management Update Component', () => {
    let comp: MeterUpdateComponentType;
    let meterServiceStub: SinonStubbedInstance<MeterService>;

    beforeEach(() => {
      route = {};
      meterServiceStub = sinon.createStubInstance<MeterService>(MeterService);
      meterServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          'font-awesome-icon': true,
          'b-input-group': true,
          'b-input-group-prepend': true,
          'b-form-datepicker': true,
          'b-form-input': true,
        },
        provide: {
          alertService,
          meterService: () => meterServiceStub,
          personService: () =>
            sinon.createStubInstance<PersonService>(PersonService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          addressService: () =>
            sinon.createStubInstance<AddressService>(AddressService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('load', () => {
      beforeEach(() => {
        const wrapper = shallowMount(MeterUpdate, { global: mountOptions });
        comp = wrapper.vm;
      });
      it('Should convert date from string', () => {
        // GIVEN
        const date = new Date('2019-10-15T11:42:02Z');

        // WHEN
        const convertedDate = comp.convertDateTimeFromServer(date);

        // THEN
        expect(convertedDate).toEqual(dayjs(date).format(DATE_TIME_LONG_FORMAT));
      });

      it('Should not convert date if date is not present', () => {
        expect(comp.convertDateTimeFromServer(null)).toBeNull();
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(MeterUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.meter = meterSample;
        meterServiceStub.update.resolves(meterSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(meterServiceStub.update.calledWith(meterSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        meterServiceStub.create.resolves(entity);
        const wrapper = shallowMount(MeterUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.meter = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(meterServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        meterServiceStub.find.resolves(meterSample);
        meterServiceStub.retrieve.resolves([meterSample]);

        // WHEN
        route = {
          params: {
            meterId: `${meterSample.id}`,
          },
        };
        const wrapper = shallowMount(MeterUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.meter).toMatchObject(meterSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        meterServiceStub.find.resolves(meterSample);
        const wrapper = shallowMount(MeterUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
