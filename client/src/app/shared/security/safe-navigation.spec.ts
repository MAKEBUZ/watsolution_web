import { openDocumentUrl } from './safe-navigation';

describe('Document navigation', () => {
  afterEach(() => vi.restoreAllMocks());
  it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'blob:https://example.invalid/id',
    'http://storage.example.invalid/file.pdf', 'https://user:password@storage.example.invalid/file.pdf', '', null])(
    'rejects active, insecure or credential-bearing links: %s', value => {
      const open = vi.spyOn(window, 'open').mockReturnValue(null);
      expect(() => openDocumentUrl(value)).toThrow();
      expect(open).not.toHaveBeenCalled();
    },
  );
  it('preserves signed HTTPS URLs and isolates the new tab', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const signed = 'https://storage.example.invalid/invoice.pdf?signature=example%2Fvalue';
    openDocumentUrl(signed);
    expect(open).toHaveBeenCalledWith(signed, '_blank', 'noopener,noreferrer');
  });
  it('resolves relative document paths on the application origin', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    openDocumentUrl('/documents/invoice.pdf');
    expect(open).toHaveBeenCalledWith(window.location.origin + '/documents/invoice.pdf', '_blank', 'noopener,noreferrer');
  });
});
