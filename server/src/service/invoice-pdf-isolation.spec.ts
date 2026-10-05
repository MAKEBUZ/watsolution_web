import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { InvoiceController } from '../web/rest/invoice.controller';
import { InvoiceService } from './invoice.service';

describe('Invoice PDF persistence', () => {
  let stored: any;
  let repository: any;
  let activity: any;
  let notifications: any;
  let pdf: any;
  let bucket: any;
  let controller: InvoiceController;

  beforeEach(() => {
    stored = {
      id: 7,
      status: InvoiceStatus.PENDING,
      amountDue: 15000,
      issueDate: '2026-10-01',
      dueDate: '2026-10-31',
      person: { id: 20, userId: '99', fullName: 'Test subscriber' },
      meter: { id: 4 },
      boldOrderId: 'order-before-payment',
      boldTransactionId: null,
    };
    repository = {
      findOne: jest.fn(async () => (stored ? { ...stored } : null)),
      save: jest.fn(async value => {
        stored = { ...stored, ...value };
        return { ...stored };
      }),
      update: jest.fn(async (_id, changes) => {
        if (!stored) return { affected: 0 };
        Object.assign(stored, changes);
        return { affected: 1 };
      }),
    };
    activity = { save: jest.fn() };
    notifications = { send: jest.fn() };
    pdf = { generate: jest.fn().mockResolvedValue(Buffer.from('synthetic PDF')) };
    bucket = { uploadPdf: jest.fn().mockResolvedValue(undefined), getPresignedUrl: jest.fn().mockResolvedValue('signed-url') };
    const service = new InvoiceService(repository, activity, {} as any, notifications);
    controller = new InvoiceController(service, pdf, bucket, notifications);
    jest.spyOn(controller.logger, 'error').mockImplementation(() => {});
  });

  const generate = (controller: InvoiceController, route: string) =>
    route === 'download' ? controller.getDownloadUrl(7) : controller.generatePdf({ user: { id: 1, login: 'admin' } } as any, 7);

  it.each(['download', 'admin'])('preserves a payment arriving during %s PDF upload', async route => {
    bucket.uploadPdf.mockImplementation(async () => {
      Object.assign(stored, {
        status: InvoiceStatus.PAID,
        boldTransactionId: 'paid-transaction',
        boldOrderId: 'paid-order',
        amountDue: 18000,
      });
    });
    const result = await generate(controller, route);
    expect(stored).toMatchObject({
      status: InvoiceStatus.PAID,
      boldTransactionId: 'paid-transaction',
      boldOrderId: 'paid-order',
      amountDue: 18000,
      pdfUrl: 'facturacion/FAC-7.pdf',
      person: { id: 20 },
      meter: { id: 4 },
    });
    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      7,
      route === 'download' ? { pdfUrl: 'facturacion/FAC-7.pdf' } : { pdfUrl: 'facturacion/FAC-7.pdf', lastModifiedBy: 'admin' },
    );
    expect(activity.save).not.toHaveBeenCalled();
    expect(notifications.send).not.toHaveBeenCalled();
    if (route === 'admin') expect(result).toMatchObject({ status: InvoiceStatus.PAID, boldTransactionId: 'paid-transaction' });
    else expect(result).toEqual({ url: 'signed-url' });
  });

  it.each(['download', 'admin'])('does not recreate an invoice deleted during %s PDF upload', async route => {
    bucket.uploadPdf.mockImplementation(async () => {
      stored = null;
    });
    await expect(generate(controller, route)).rejects.toBeInstanceOf(NotFoundException);
    expect(stored).toBeNull();
    expect(repository.save).not.toHaveBeenCalled();
    expect(bucket.getPresignedUrl).not.toHaveBeenCalled();
  });

  it.each(['download', 'admin'])('returns 404 without uploading when invoice is absent (%s)', async route => {
    stored = null;
    await expect(generate(controller, route)).rejects.toBeInstanceOf(NotFoundException);
    expect(pdf.generate).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('returns the existing PDF without changing the invoice', async () => {
    stored.pdfUrl = 'facturacion/existing.pdf';
    await expect(controller.getDownloadUrl(7)).resolves.toEqual({ url: 'signed-url' });
    expect(bucket.getPresignedUrl).toHaveBeenCalledWith(stored.pdfUrl);
    expect(pdf.generate).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it.each(['generate', 'upload'])('reports %s failure as a service failure, without storing a PDF key', async stage => {
    if (stage === 'generate') pdf.generate.mockRejectedValue(new Error('synthetic renderer failure'));
    else bucket.uploadPdf.mockRejectedValue(new Error('synthetic storage failure'));
    await expect(controller.getDownloadUrl(7)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(stored.status).toBe(InvoiceStatus.PENDING);
    expect(stored.pdfUrl).toBeUndefined();
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });
});
