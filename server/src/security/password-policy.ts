import { BadRequestException } from '@nestjs/common';

export function assertPassword(password: unknown, login?: string): asserts password is string {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72 || password.trim().length < 12 || password.toLowerCase() === login?.toLowerCase()) {
    throw new BadRequestException('Use a unique password of at least 12 characters and at most 72 UTF-8 bytes');
  }
}
