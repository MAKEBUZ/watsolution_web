// @vitest-environment node
import { swaggerAssets } from '../../../../swagger-assets.mts';

describe('Documentation asset boundary', () => {
  it('emits the documentation UI and its dependencies without copying project configuration', () => {
    const plugin = swaggerAssets();
    const emitFile = vi.fn();
    (plugin.generateBundle as Function).call({ emitFile });
    const names = emitFile.mock.calls.map(([asset]) => asset.fileName);
    expect(names).toContain('swagger-ui/index.html');
    expect(names).toContain('swagger-ui/swagger-ui-bundle.js');
    expect(names).toContain('swagger-ui/axios.min.js');
    expect(names.every(name => /^swagger-ui\/[\w.-]+\.(js|css|html|png)$/.test(name))).toBe(true);
  });
  it.each(['/../../package.json', '/%2e%2e/.env', '/.env'])('does not read arbitrary filesystem paths: %s', url => {
    const use = vi.fn();
    (swaggerAssets().configureServer as Function)({ middlewares: { use } });
    const handler = use.mock.calls[0][1];
    const end = vi.fn(), next = vi.fn();
    handler({ url, method: 'GET' }, { end, setHeader: vi.fn() }, next);
    expect(end).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
