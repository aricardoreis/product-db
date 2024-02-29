import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TransformInterceptor } from './transform-interceptor';

const RETURN_VALUE = 'test';
const interceptor = new TransformInterceptor();

@Controller('test')
class TestController {
  @Get()
  get() {
    return RETURN_VALUE;
  }
}

@Module({
  controllers: [TestController],
})
class TestModule {}

describe('TransformInterceptor', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = (
      await Test.createTestingModule({
        imports: [TestModule],
        providers: [
          {
            provide: APP_INTERCEPTOR,
            useValue: interceptor,
          },
        ],
      }).compile()
    ).createNestApplication();

    await app.init();
  });

  it(`should be defined`, () => {
    expect(interceptor).toBeDefined();
  });

  it(`should transform response`, async () => {
    await request(app.getHttpServer())
      .get('/test')
      .expect(200, { success: true, result: RETURN_VALUE });
  });
});
