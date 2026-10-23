/** Open API-provided document links without executing active URL schemes or sharing the opener. */
export function openDocumentUrl(value: unknown): void {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Invalid document URL');
  const url = new URL(value, window.location.origin);
  const localHttp = url.protocol === 'http:' && url.origin === window.location.origin
    && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !localHttp) || url.username || url.password) {
    throw new Error('Unsafe document URL');
  }
  window.open(url.href, '_blank', 'noopener,noreferrer');
}
