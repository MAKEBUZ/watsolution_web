/** Publication dates are calendar days: do not shift YYYY-MM-DD through UTC. */
export function formatNewsDate(value?: Date | string | null): string {
  if (!value) return '';
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}
