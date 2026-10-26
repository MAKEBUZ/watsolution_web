import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminController } from './admin.controller';

jest.mock('qrcode', () => ({ toBuffer: jest.fn().mockResolvedValue(Buffer.from('png')) }));

describe('Subscriber QR privacy and input validation', () => {
  const people = { findOne: jest.fn() };
  const bucket = { uploadFile: jest.fn(), getPresignedUrl: jest.fn().mockResolvedValue('https://example.invalid/signed') };
  const controller = new AdminController(null, null, null, null, bucket as any, null, null, people as any);

  beforeEach(() => jest.clearAllMocks());

  it('uses only the subscriber identifier and a five-minute private download', async () => {
    people.findOne.mockResolvedValue({ id: 42, fullName: 'Private name', documentNumber: 'private-document' });
    const result = await controller.getSubscriberQr(42);
    expect(people.findOne).toHaveBeenCalledWith({ where: { id: 42 }, select: { id: true } });
    expect(require('qrcode').toBuffer).toHaveBeenCalledWith(
      JSON.stringify({ v: 2, personId: 42 }),
      expect.objectContaining({ type: 'png' }),
    );
    expect(bucket.uploadFile).toHaveBeenCalledWith('qr-suscriptores/QR-42.png', expect.any(Buffer), 'image/png');
    expect(bucket.getPresignedUrl).toHaveBeenCalledWith('qr-suscriptores/QR-42.png', 300);
    expect(result.filename).toBe('QR-WatSolution-42.png');
    // Metadata belongs to the unbound Nest handler; binding would discard it.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Reflect.getMetadata('roles', controller.getSubscriberQr)).toEqual(['ROLE_ADMIN']);
  });

  it.each([0, -1, 1.5, NaN, Infinity, 2147483648, Number.MAX_SAFE_INTEGER])(
    'rejects invalid identifier %s before storage access',
    async id => {
      await expect(controller.getSubscriberQr(id)).rejects.toBeInstanceOf(BadRequestException);
      expect(people.findOne).not.toHaveBeenCalled();
      expect(bucket.uploadFile).not.toHaveBeenCalled();
    },
  );

  it('does not generate a QR for a nonexistent subscriber', async () => {
    people.findOne.mockResolvedValue(null);
    await expect(controller.getSubscriberQr(42)).rejects.toBeInstanceOf(NotFoundException);
    expect(bucket.uploadFile).not.toHaveBeenCalled();
  });
});
