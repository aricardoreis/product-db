import { Injectable, NestMiddleware } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PagerMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLogger) {}

  use(req: any, _res: any, next: (error?: any) => void) {
    const limit = Math.abs(+req.query.limit) || 10;
    const page = Math.abs(+req.query.page) || 1;

    Object.defineProperty(req, 'query', {
      value: { ...req.query, limit, page },
      writable: true,
      configurable: true,
    });

    this.logger.assign({ _pager: { limit, page } });

    next();
  }
}
