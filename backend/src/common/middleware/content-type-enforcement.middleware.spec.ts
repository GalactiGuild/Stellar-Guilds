import { UnsupportedMediaTypeException } from '@nestjs/common';
import { ContentTypeEnforcementMiddleware } from './content-type-enforcement.middleware';
import { Request, Response, NextFunction } from 'express';

describe('ContentTypeEnforcementMiddleware', () => {
  let middleware: ContentTypeEnforcementMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new ContentTypeEnforcementMiddleware();
    mockRequest = {
      method: 'POST',
      path: '/api/v1/users',
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('Non-write methods (GET, DELETE, HEAD, OPTIONS)', () => {
    it('should allow GET requests without Content-Type', () => {
      mockRequest.method = 'GET';
      delete mockRequest.headers['content-type'];

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow DELETE requests without Content-Type', () => {
      mockRequest.method = 'DELETE';
      delete mockRequest.headers['content-type'];

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow HEAD requests without Content-Type', () => {
      mockRequest.method = 'HEAD';
      delete mockRequest.headers['content-type'];

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow OPTIONS requests without Content-Type', () => {
      mockRequest.method = 'OPTIONS';
      delete mockRequest.headers['content-type'];

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Write methods (POST, PATCH, PUT) with application/json', () => {
    it('should allow POST with application/json', () => {
      mockRequest.method = 'POST';
      mockRequest.headers['content-type'] = 'application/json';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow PATCH with application/json', () => {
      mockRequest.method = 'PATCH';
      mockRequest.headers['content-type'] = 'application/json';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow PUT with application/json', () => {
      mockRequest.method = 'PUT';
      mockRequest.headers['content-type'] = 'application/json';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow application/json with charset parameter', () => {
      mockRequest.method = 'POST';
      mockRequest.headers['content-type'] = 'application/json; charset=utf-8';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle case-insensitive content-type', () => {
      mockRequest.method = 'POST';
      mockRequest.headers['content-type'] = 'Application/JSON';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Missing Content-Type header', () => {
    it('should reject POST without Content-Type', () => {
      mockRequest.method = 'POST';
      delete mockRequest.headers['content-type'];

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(UnsupportedMediaTypeException);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject PATCH without Content-Type', () => {
      mockRequest.method = 'PATCH';
      delete mockRequest.headers['content-type'];

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(UnsupportedMediaTypeException);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject PUT without Content-Type', () => {
      mockRequest.method = 'PUT';
      delete mockRequest.headers['content-type'];

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(UnsupportedMediaTypeException);

      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Content-Type', () => {
    it('should reject POST with text/plain', () => {
      mockRequest.method = 'POST';
      mockRequest.headers['content-type'] = 'text/plain';

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(UnsupportedMediaTypeException);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject POST with application/xml', () => {
      mockRequest.method = 'POST';
      mockRequest.headers['content-type'] = 'application/xml';

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(UnsupportedMediaTypeException);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject POST with application/x-www-form-urlencoded', () => {
      mockRequest.method = 'POST';
      mockRequest.headers['content-type'] = 'application/x-www-form-urlencoded';

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(UnsupportedMediaTypeException);

      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Multipart/form-data for file uploads', () => {
    it('should allow multipart/form-data for user avatar upload', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/v1/users/me/avatar';
      mockRequest.headers['content-type'] =
        'multipart/form-data; boundary=----WebKitFormBoundary';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow multipart/form-data for guild avatar upload', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/v1/guilds/123/avatar';
      mockRequest.headers['content-type'] = 'multipart/form-data';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow multipart/form-data for guild banner upload', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/v1/guilds/456/banner';
      mockRequest.headers['content-type'] = 'multipart/form-data';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow multipart/form-data for bulk invite', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/v1/guilds/789/members/bulk-invite';
      mockRequest.headers['content-type'] = 'multipart/form-data';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject multipart/form-data for non-upload routes', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/v1/users';
      mockRequest.headers['content-type'] = 'multipart/form-data';

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(UnsupportedMediaTypeException);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject multipart/form-data for auth routes', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/v1/auth/login';
      mockRequest.headers['content-type'] = 'multipart/form-data';

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(UnsupportedMediaTypeException);

      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Error messages', () => {
    it('should provide helpful error message when Content-Type is missing', () => {
      mockRequest.method = 'POST';
      delete mockRequest.headers['content-type'];

      try {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnsupportedMediaTypeException);
        expect(error.message).toContain('Content-Type header is required');
        expect(error.message).toContain('application/json');
      }
    });

    it('should provide helpful error message for wrong Content-Type', () => {
      mockRequest.method = 'POST';
      mockRequest.headers['content-type'] = 'text/html';

      try {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnsupportedMediaTypeException);
        expect(error.message).toContain('Unsupported Content-Type');
        expect(error.message).toContain('text/html');
        expect(error.message).toContain('application/json');
      }
    });

    it('should provide helpful error message for multipart on wrong route', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/v1/bounties';
      mockRequest.headers['content-type'] = 'multipart/form-data';

      try {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnsupportedMediaTypeException);
        expect(error.message).toContain('multipart/form-data');
        expect(error.message).toContain('file upload endpoints');
        expect(error.message).toContain('application/json');
      }
    });
  });
});
