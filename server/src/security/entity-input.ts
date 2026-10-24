import { BadRequestException } from '@nestjs/common';

export function matchingId(body: { id?: number }, path?: string | number): number {
  const id = path === undefined ? body?.id : Number(path);
  if (!Number.isSafeInteger(id) || id < 1 || (body?.id !== undefined && body.id !== id)) {
    throw new BadRequestException('Invalid or mismatched record identifier');
  }
  return id;
}

/** Copy known data fields only; never copy prototypes, audit fields or relations implicitly. */
export function pickFields<T>(source: unknown, fields: readonly string[]): T {
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new BadRequestException('Invalid record');
  const result = {};
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) result[key] = source[key];
  }
  return result as T;
}
