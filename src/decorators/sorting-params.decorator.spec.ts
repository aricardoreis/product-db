import {
  Controller,
  Get,
  INestApplication,
  Module,
  Post,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SortingParam, SortingParams } from './sorting-params.decorator';
import * as request from 'supertest';

@Controller('test')
class TestController {
  @Get()
  get(@SortingParams(['name']) sort?: SortingParam) {
    return sort;
  }

  @Post()
  post(@SortingParams('name') sort?: SortingParam) {
    return sort;
  }
}

@Module({
  controllers: [TestController],
})
class TestModule {}

describe('SortingParams', () => {
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

  it('should work as expected', async () => {
    const params: SortingParam = { field: 'name', order: 'asc' };
    await request(app.getHttpServer())
      .get(`/test?sort=${params.field}:${params.order}`)
      .expect(200, params);
  });

  it('should throw an error when the field is invalid', async () => {
    const params: SortingParam = { field: 'id', order: 'desc' };
    await request(app.getHttpServer())
      .get(`/test?sort=${params.field}:${params.order}`)
      .expect(406);
  });

  it('should throw an error when the order is invalid', async () => {
    const params: SortingParam = { field: 'name', order: 'invalid' };
    await request(app.getHttpServer())
      .get(`/test?sort=${params.field}:${params.order}`)
      .expect(406);
  });

  it('should throw an error when the param is invalid', async () => {
    await request(app.getHttpServer()).get(`/test?sort=abcde13245`).expect(406);
  });

  it('should throw an error when valid params is not an array', async () => {
    await request(app.getHttpServer()).post(`/test?sort=abcde`).expect(406);
  });

  it('should load nothing when it is not provided', async () => {
    await request(app.getHttpServer()).get(`/test?`).expect(200, '');
  });
});
