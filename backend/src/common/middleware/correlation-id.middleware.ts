import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContext } from '../utils/async-storage';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('X-Request-Id', correlationId);

    const store = new Map<string, string>();
    store.set('correlationId', correlationId);

    requestContext.run(store, () => {
      next();
    });
  }
}
