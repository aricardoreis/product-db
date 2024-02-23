import {
  Controller,
  Get,
  INestApplication,
  MiddlewareConsumer,
  Module,
  Post,
  Query,
  RequestMethod,
} from '@nestjs/common';
import { AppModule } from '../app.module';
import { PagerMiddleware } from './pager.middleware';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

@Controller('test')
class TestController {
  @Get()
  get(@Query() { limit, page }) {
    return [limit, page];
  }

  @Post()
  post(@Query() { limit, page }) {
    return [limit, page];
  }
}

@Module({
  imports: [AppModule],
  controllers: [TestController],
})
class TestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}

describe('PagerMiddleware', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = (
      await Test.createTestingModule({
        imports: [TestModule],
      }).compile()
    ).createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should load default params when no query params are provided', async () => {
    const limit = 10;
    const page = 1;
    const defaultParams = [limit, page];
    const expected = defaultParams;

    await request(app.getHttpServer()).get('/test').expect(200, expected);
  });

  it('should load values from query params when provided', async () => {
    const limit = 5;
    const page = 2;
    const expected = [limit, page];

    await request(app.getHttpServer())
      .get(`/test?limit=${limit}&page=${page}`)
      .expect(200, expected);
  });

  it('should fix values when they are provided out of range (invalid)', async () => {
    const limit = -5;
    const page = -2;
    const expected = [Math.abs(limit), Math.abs(page)];

    await request(app.getHttpServer())
      .get(`/test?limit=${limit}&page=${page}`)
      .expect(200, expected);
  });

  it('should not load values when request method is not GET', async () => {
    const expected = [null, null];

    await request(app.getHttpServer()).post('/test').expect(201, expected);
  });
});
