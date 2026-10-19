import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AutoNote API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated requests to protected vehicle endpoint (401)', () => {
    return request(app.getHttpServer()).get('/api/vehicles').expect(401);
  });

  it('rejects login with missing fields (400)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({})
      .expect(400);
  });

  it('returns 404 for invalid public report token', () => {
    return request(app.getHttpServer())
      .get('/api/reports/public/non-existent-token')
      .expect(404);
  });
});
