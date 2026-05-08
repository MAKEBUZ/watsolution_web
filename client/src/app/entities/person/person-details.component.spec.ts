import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import PersonDetails from './person-details.vue';
import PersonService from './person.service';
import AlertService from '@/shared/alert/alert.service';

type PersonDetailsComponentType = InstanceType<typeof PersonDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const personSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Person Management Detail Component', () => {
    let personServiceStub: SinonStubbedInstance<PersonService>;
    let mountOptions: MountingOptions<PersonDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      personServiceStub = sinon.createStubInstance<PersonService>(PersonService);

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
          personService: () => personServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        personServiceStub.find.resolves(personSample);
        route = {
          params: {
            personId: `${123}`,
          },
        };
        const wrapper = shallowMount(PersonDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.person).toMatchObject(personSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        personServiceStub.find.resolves(personSample);
        const wrapper = shallowMount(PersonDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
