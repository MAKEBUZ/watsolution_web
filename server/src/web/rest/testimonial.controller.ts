import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from '../../domain/testimonial.entity';
import { AuthGuard, RolesGuard, Roles, RoleType } from '../../security';

export function testimonialInput(body: any) {
  if (!body || typeof body !== 'object') throw new BadRequestException();
  const clean: any = {};
  for (const [key, max] of [
    ['name', 120],
    ['role', 120],
    ['company', 160],
    ['text', 3000],
  ] as const) {
    if (typeof body[key] !== 'string' || body[key].trim().length > max || (['name', 'text'].includes(key) && !body[key].trim()))
      throw new BadRequestException('Revisa el nombre y el testimonio.');
    clean[key] = body[key].trim();
  }
  if (typeof body.published !== 'boolean' || !Number.isSafeInteger(body.position) || body.position < 0 || body.position > 10000)
    throw new BadRequestException();
  return { ...clean, published: body.published, position: body.position };
}

@Controller('api/admin/testimonials')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class TestimonialController {
  constructor(@InjectRepository(Testimonial) private readonly repo: Repository<Testimonial>) {}
  @Get() list() {
    return this.repo.find({ order: { position: 'ASC', id: 'DESC' } });
  }
  @Post() create(@Body() body: unknown) {
    return this.repo.save(this.repo.create(testimonialInput(body)));
  }
  @Put(':id') async update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    if (!(await this.repo.existsBy({ id }))) throw new NotFoundException();
    await this.repo.update(id, testimonialInput(body));
    return this.repo.findOneBy({ id });
  }
  @Delete(':id') async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.delete(id);
  }
}

@Controller('api/public/testimonials')
export class PublicTestimonialController {
  constructor(@InjectRepository(Testimonial) private readonly repo: Repository<Testimonial>) {}
  @Get() list() {
    return this.repo.find({
      where: { published: true },
      order: { position: 'ASC', id: 'ASC' },
      select: ['id', 'name', 'role', 'company', 'text'],
      take: 30,
    });
  }
}
