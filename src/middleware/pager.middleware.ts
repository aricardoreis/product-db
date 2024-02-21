import { Logger, NestMiddleware } from '@nestjs/common';

export class PagerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PagerMiddleware.name);
  use(req: any, res: any, next: (error?: any) => void) {
    req.query.limit = Math.abs(+req.query.limit) || 10;
    req.query.page = Math.abs(+req.query.page) || 1;

    this.logger.log(`pager ${req.query.limit} ${req.query.page}`);

    next();
  }
}
