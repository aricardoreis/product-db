import { Logger, NestMiddleware } from '@nestjs/common';

export class PagerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PagerMiddleware.name);
  use(req: any, _res: any, next: (error?: any) => void) {
    const limit = Math.abs(+req.query.limit) || 10;
    const page = Math.abs(+req.query.page) || 1;

    Object.defineProperty(req, 'query', {
      value: { ...req.query, limit, page },
      writable: true,
      configurable: true,
    });

    this.logger.log(`pager ${limit} ${page}`);

    next();
  }
}
