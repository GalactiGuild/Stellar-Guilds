import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { ContentTypeEnforcementMiddleware } from './content-type-enforcement.middleware';

describe('ContentTypeEnforcementMiddleware (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the middleware globally as it would be in main.ts
    app.use(new ContentTypeEnforcementMiddleware().use.bind(new ContentTypeEnforcementMiddleware()));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET requests (should pass without Content-Type)', () => {
    it('should allow GET /api/health without Content-Type', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect((res) => {
          // Should not get 415 error
          expect(res.status).not.toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        });
    });
  });

  describe('POST requests without Content-Type', () => {
    it('should reject POST without Content-Type header', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ username: 'test', email: 'test@example.com' })
        .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .expect((res) => {
          expect(res.body.message).toContain('Content-Type header is required');
        });
    });
  });

  describe('POST requests with wrong Content-Type', () => {
    it('should reject POST with text/plain', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'text/plain')
        .send('username=test&email=test@example.com')
        .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .expect((res) => {
          expect(res.body.message).toContain('Unsupported Content-Type');
          expect(res.body.message).toContain('text/plain');
        });
    });

    it('should reject POST with application/x-www-form-urlencoded', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('username=test&email=test@example.com')
        .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .expect((res) => {
          expect(res.body.message).toContain('Unsupported Content-Type');
        });
    });
  });

  describe('POST requests with application/json', () => {
    it('should allow POST with application/json', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({ username: 'test', email: 'test@example.com', password: 'Test123!' })
        .expect((res) => {
          // Should not get 415 error (may get validation or other errors, but not 415)
          expect(res.status).not.toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        });
    });

    it('should allow POST with application/json; charset=utf-8', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({ username: 'test', email: 'test@example.com', password: 'Test123!' })
        .expect((res) => {
          // Should not get 415 error
          expect(res.status).not.toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        });
    });
  });

  describe('PATCH requests', () => {
    it('should reject PATCH without Content-Type', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ displayName: 'New Name' })
        .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    });

    it('should allow PATCH with application/json', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Content-Type', 'application/json')
        .send({ displayName: 'New Name' })
        .expect((res) => {
          // Should not get 415 error (will get 401 unauthorized, but not 415)
          expect(res.status).not.toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        });
    });
  });

  describe('PUT requests', () => {
    it('should reject PUT without Content-Type', () => {
      return request(app.getHttpServer())
        .put('/api/v1/bounties/123')
        .send({ title: 'Updated' })
        .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    });

    it('should allow PUT with application/json', () => {
      return request(app.getHttpServer())
        .put('/api/v1/bounties/123')
        .set('Content-Type', 'application/json')
        .send({ title: 'Updated' })
        .expect((res) => {
          // Should not get 415 error
          expect(res.status).not.toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        });
    });
  });

  describe('Multipart/form-data for file uploads', () => {
    it('should reject multipart/form-data on non-upload routes', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .expect((res) => {
          expect(res.body.message).toContain('multipart/form-data');
          expect(res.body.message).toContain('file upload endpoints');
        });
    });

    it('should allow multipart/form-data on avatar upload route', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users/me/avatar')
        .set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundary')
        .expect((res) => {
          // Should not get 415 error (will get 401 or other errors, but not 415)
          expect(res.status).not.toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        });
    });
  });

  describe('CSRF attack prevention', () => {
    it('should block form-based CSRF attempts', () => {
      // Simulating a CSRF attack using form submission
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('email=attacker@evil.com&password=hacked')
        .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .expect((res) => {
          expect(res.body.message).toContain('Unsupported Content-Type');
        });
    });

    it('should block text/plain CSRF attempts', () => {
      // Some CSRF attacks use text/plain to bypass CORS preflight
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Content-Type', 'text/plain')
        .send('{"email":"attacker@evil.com","password":"hacked"}')
        .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    });
  });
});
