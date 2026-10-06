import { TankLevelGateway } from './tank-level.gateway';

describe('Tank without a verified sensor source', () => {
  it('reports unavailable without measurements or scheduled synthetic events', () => {
    jest.useFakeTimers();
    try {
      const emit = jest.fn();
      const gateway = new TankLevelGateway();
      gateway.handleConnection({ emit } as any);
      jest.advanceTimersByTime(60000);
      expect(emit.mock.calls).toEqual([['tank-status', {
        status: 'unavailable', source: null, quality: 'unverified', level: null, measuredAt: null,
      }]]);
      expect(jest.getTimerCount()).toBe(0);
    } finally { jest.useRealTimers(); }
  });
});
