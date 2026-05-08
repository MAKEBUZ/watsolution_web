import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/security/guards/auth.guard';
import { RolesGuard } from '../src/security/guards/roles.guard';
import { MeterDTO } from '../src/service/dto/meter.dto';
import { MeterService } from '../src/service/meter.service';

describe('Meter Controller', () => {
  let app: INestApplication;

  const authGuardMock = { canActivate: (): any => true };
  const rolesGuardMock = { canActivate: (): any => true };
  const entityMock: any = {
    id: 'entityId',
  };

  const serviceMock = {
    findById: (): any => entityMock,
    findAndCount: (): any => [entityMock, 0],
    save: (): any => entityMock,
    update: (): any => entityMock,
    deleteById: (): any => entityMock,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .overrideProvider(MeterService)
      .useValue(serviceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/GET all meters ', async () => {
    const getEntities: MeterDTO[] = (await request(app.getHttpServer()).get('/api/meters').expect(200)).body;

    expect(getEntities).toEqual(entityMock);
  });

  it('/GET meters by id', async () => {
    const getEntity: MeterDTO = (await request(app.getHttpServer()).get(`/api/meters/${entityMock.id}`).expect(200)).body;

    expect(getEntity).toEqual(entityMock);
  });

  it('/POST create meters', async () => {
    const createdEntity: MeterDTO = (await request(app.getHttpServer()).post('/api/meters').send(entityMock).expect(201)).body;

    expect(createdEntity).toEqual(entityMock);
  });

  it('/PUT update meters', async () => {
    const updatedEntity: MeterDTO = (await request(app.getHttpServer()).put('/api/meters').send(entityMock).expect(201)).body;

    expect(updatedEntity).toEqual(entityMock);
  });

  it('/PUT update meters from id', async () => {
    const updatedEntity: MeterDTO = (await request(app.getHttpServer()).put(`/api/meters/${entityMock.id}`).send(entityMock).expect(201))
      .body;

    expect(updatedEntity).toEqual(entityMock);
  });

  it('/DELETE meters', async () => {
    const deletedEntity: MeterDTO = (await request(app.getHttpServer()).delete(`/api/meters/${entityMock.id}`).expect(204)).body;

    expect(deletedEntity).toEqual({});
  });

  afterEach(async () => {
    await app?.close();
  });
});
