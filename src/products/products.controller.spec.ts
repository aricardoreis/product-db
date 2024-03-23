import { Test, TestingModule } from '@nestjs/testing';
import { PaginationAndFilterOptions } from 'src/paginate';
import { serviceMock } from './../../test/mocks';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { SortingParam } from 'src/decorators/sorting-params.decorator';

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
    const sort: SortingParam = {
      field: 'name',
      order: 'asc',
    };
    const result = await controller.findAll(options, sort);

    expect(result.length).toEqual(list.length);
    expect(serviceMock.findAll).toHaveBeenCalledWith(options, sort);
  });

  it('should update one product by id', async () => {
    serviceMock.update.mockReturnValue(product);

    const updatedProduct: UpdateProductDto = {
      name: 'Updated Product',
    };

    await controller.update(product.id.toString(), updatedProduct);

    expect(serviceMock.update).toHaveBeenCalledWith(product.id, updatedProduct);
  });
});
