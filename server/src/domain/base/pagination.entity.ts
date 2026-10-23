/* eslint-disable max-classes-per-file */
import { Expose as JsonProperty, Type } from 'class-transformer';
import { ParsedQs } from 'qs';
import { BaseEntity } from './base.entity';
import { BadRequestException } from '@nestjs/common';

export class Sort {
  public property: string;
  public direction: 'ASC' | 'DESC';
  constructor(sort: string, allowedFields: readonly string[] = ['id']) {
    const [property, direction = 'ASC', extra] = typeof sort === 'string' ? sort.split(',') : [];
    if (
      !allowedFields.includes(property) ||
      extra !== undefined ||
      !/^(asc|desc)$/i.test(direction) ||
      property.split('.').some(key => ['__proto__', 'prototype', 'constructor'].includes(key))
    ) {
      throw new BadRequestException('Invalid sort');
    }
    this.property = property;
    this.direction = direction.toUpperCase() as 'ASC' | 'DESC';
  }

  asOrder(): any {
    // Relation columns are explicit allow-listed paths, never SQL fragments.
    return this.property.split('.').reduceRight<any>((value, key) => ({ [key]: value }), this.direction);
  }
}

export type PaginationQueryType = string | ParsedQs | (string | ParsedQs)[];

export class PageRequest {
  @JsonProperty()
  page = 0;
  @JsonProperty()
  size = 20;
  @Type(() => Sort)
  sort: Sort = new Sort('id,ASC');

  constructor(
    page: number | PaginationQueryType,
    size: number | PaginationQueryType,
    sort: PaginationQueryType,
    allowedFields: readonly string[] = ['id'],
  ) {
    this.page = PageRequest.handleNumberTypes(page, this.page);
    this.size = PageRequest.handleNumberTypes(size, this.size);
    if (this.page < 0 || this.size < 1 || this.size > 500 || !Number.isSafeInteger(this.page * this.size)) {
      throw new BadRequestException('Invalid pagination');
    }
    const sorts = sort === undefined ? ['id,ASC'] : Array.isArray(sort) ? sort : [sort];
    if (!sorts.length || sorts.length > 10 || sorts.some(value => typeof value !== 'string')) {
      throw new BadRequestException('Invalid sort');
    }
    const validated = sorts.map(value => new Sort(value as string, allowedFields));
    this.sort = validated[0];
  }

  public static handleNumberTypes(pp: number | PaginationQueryType, fallback: number): number {
    if (pp === undefined) return fallback;
    if ((typeof pp !== 'number' && (typeof pp !== 'string' || !/^\d+$/.test(pp))) || !Number.isSafeInteger(Number(pp))) {
      throw new BadRequestException('Invalid pagination');
    }
    return Number(pp);
  }

  public static handleQueryType(pa: PaginationQueryType): string | undefined {
    pa = Array.isArray(pa) ? pa[0] : pa;
    if (typeof pa === 'string') {
      return pa;
    }
    return undefined;
  }
}

export class Page<T extends BaseEntity> {
  constructor(
    public content: T[],
    public total: number,
    public pageable: PageRequest,
  ) {}
}
