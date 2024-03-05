import { Test, TestingModule } from '@nestjs/testing';
import { PaginationAndFilterOptions } from 'src/paginate';
import { serviceMock } from './../../test/mocks';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const product: Product = {
  id: 1234567890,
  name: 'Test Product',
  type: 'Un',
  code: '1234657890',
  amount: 1,
  priceHistory: [],
  isEan: true,
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsService,
          useValue: serviceMock,
        },
      ],
      controllers: [ProductsController],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should retrieve one product by id', async () => {
    serviceMock.findOne.mockReturnValue(product);

    expect(await controller.findOne(1)).toEqual(product);
  });

  it('should retrieve all products', async () => {
    const list: Product[] = [product, product];
    serviceMock.findAll.mockReturnValue(list);

    const options: PaginationAndFilterOptions = {
      limit: 10,
      page: 1,
      keyword: 'abcde',
    };
    const result = await controller.findAll(options);

    expect(result.length).toEqual(list.length);
    expect(serviceMock.findAll).toHaveBeenCalledWith(options);
  });
});
