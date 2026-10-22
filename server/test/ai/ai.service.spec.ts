import { AiService } from '../../src/service/ai.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('Optional assistant configuration', () => {
  const previous = process.env.OPENAI_API_KEY;
  afterEach(() => {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  });
  it('allows the application to initialize without an AI API key', () => {
    delete process.env.OPENAI_API_KEY;
    expect(() => new AiService({} as any, {} as any, {} as any)).not.toThrow();
  });
  it('reports unavailability when an AI operation is requested without credentials', async () => {
    delete process.env.OPENAI_API_KEY;
    const service = new AiService({} as any, {} as any, {} as any);
    await expect(service.indexDocument('test')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
