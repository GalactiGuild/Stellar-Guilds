import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Rate Limiting (Throttler) e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow requests within the limit (auth/login)', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `test${i}@example.com`, password: 'password123' })
        .expect((res) => {
          expect(res.status).not.toBe(429);
        });
    }
  });

  it('should return 429 Too Many Requests on the 11th request to auth/login', async () => {
    // First 10 requests should pass
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `rate${i}@example.com`, password: 'password123' });
    }

    // 11th request should be throttled
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'throttled@example.com', password: 'password123' });

    expect(response.status).toBe(429);
    expect(response.body).toBeDefined();
  });

  it('should return 429 on rapid auth/register requests', async () => {
    let lastStatus = 0;

    for (let i = 0; i < 12; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `ratelimit${i}@example.com`,
          password: 'Password123!',
        });
      lastStatus = res.status;
    }

    // After exceeding the 10 req/60s limit, should get 429
    expect(lastStatus).toBe(429);
  });

  it('should allow non-auth endpoints at default 100 req/60s', async () => {
    for (let i = 0; i < 50; i++) {
      await request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(res.status).not.toBe(429);
        });
    }
  });
});
