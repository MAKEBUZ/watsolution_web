import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import MeterDetails from './meter-details.vue';
import MeterService from './meter.service';
import AlertService from '@/shared/alert/alert.service';

type MeterDetailsComponentType = InstanceType<typeof MeterDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const meterSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Meter Management Detail Component', () => {
    let meterServiceStub: SinonStubbedInstance<MeterService>;
    let mountOptions: MountingOptions<MeterDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      meterServiceStub = sinon.createStubInstance<MeterService>(MeterService);

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          'font-awesome-icon': true,
          'router-link': true,
        },
        provide: {
          alertService,
          meterService: () => meterServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        meterServiceStub.find.resolves(meterSample);
        route = {
          params: {
            meterId: `${123}`,
          },
        };
        const wrapper = shallowMount(MeterDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.meter).toMatchObject(meterSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        meterServiceStub.find.resolves(meterSample);
        const wrapper = shallowMount(MeterDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
