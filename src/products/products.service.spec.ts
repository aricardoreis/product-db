import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MockType,
  repositoryMockFactory,
} from '../../test/mocks/repository.mock';
import { CreateProductDto } from './dto/create-product.dto';
import { PriceHistory } from './entities/price-history.entity';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';

const product = {
  id: 1234,
  name: 'Test Product',
  type: 'Un',
  code: '1234657890',
  amount: 1,
  priceHistory: [
    {
      id: 1,
      date: new Date(),
      value: 1.99,
    },
  ],
};

describe('ProductsService', () => {
  let service: ProductsService;
  let repositoryMock: MockType<Repository<Product>>;
  let secondaryRepositoryMock: MockType<Repository<PriceHistory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(PriceHistory),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repositoryMock = module.get(getRepositoryToken(Product));
    secondaryRepositoryMock = module.get(getRepositoryToken(PriceHistory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a product', async () => {
    repositoryMock.findOne.mockReturnValue(product);

    await expect(service.findOne(product.id)).resolves.toEqual(product);
  });

  it('should retrieve items', async () => {
    const totalProducts = 123;
    const products = [product];

    const createQueryBuilder: any = {
      select: () => createQueryBuilder,
      leftJoin: () => createQueryBuilder,
      take: () => createQueryBuilder,
      skip: () => createQueryBuilder,
      where: () => createQueryBuilder,
      orderBy: () => createQueryBuilder,
      getManyAndCount: () => {
        return [products, totalProducts];
      },
    };
    repositoryMock.createQueryBuilder.mockReturnValue(createQueryBuilder);

    const paginationOptions = {
      limit: 5,
      page: 1,
    };
    const [items, total] = await service.findAll(paginationOptions);

    expect(items.length).toEqual(products.length);
    expect(total).toEqual(totalProducts);
  });

  it('should find a product by code', async () => {
    repositoryMock.findOne.mockReturnValue(product);

    await expect(service.findByCode(product.code)).resolves.toEqual(product);

    // try to add some additional check to differ to the findOne
  });

  it('should create a new product when there is no item with the same code on database', async () => {
    const product: CreateProductDto = {
      name: 'Test Product',
      type: 'Un',
      code: '1234567890',
      amount: 1,
      date: '2024-01-01',
      value: 1.99,
      saleId: '1',
    };
    const savedProduct = {
      ...product,
      isEan: false,
      priceHistory: [],
    };

    repositoryMock.findOne.mockReturnValueOnce(null);
    repositoryMock.save.mockReturnValue(savedProduct);

    await expect(service.create(product)).resolves.toEqual(savedProduct);

    // check productRepository.save is called with correct parameters
    expect(repositoryMock.save).toHaveBeenCalledWith(savedProduct);

    // check priceHistoryRepository.save is called with correct parameters
    expect(secondaryRepositoryMock.save).toHaveBeenCalledWith({
      value: product.value,
      date: product.date,
      product: savedProduct,
      sale_id: product.saleId,
    });
  });

  it('should update an existing product when there is already an item with the same code on database (isEan = true)', async () => {
    const product: CreateProductDto = {
      name: 'Test Product',
      type: 'Un',
      code: '12345678',
      amount: 1,
      date: '2024-01-01',
      value: 1.99,
      saleId: '1',
    };
    const existingProduct: Product = {
      id: 1,
      ...product,
      isEan: true,
      priceHistory: [],
    };

    await createOrUpdateProduct(existingProduct, product, 0, 1);
  });

  it('should create a new product when there is an existing product when there is already an item with the same code on database, but isEan = false', async () => {
    const product: CreateProductDto = {
      name: 'Test Product',
      type: 'Un',
      code: '12345678',
      amount: 1,
      date: '2024-01-01',
      value: 1.99,
      saleId: '1',
    };
    const existingProduct: Product = {
      id: 1,
      ...product,
      isEan: false,
      priceHistory: [],
    };

    await createOrUpdateProduct(existingProduct, product, 1, 1);
  });

  it('should update one product by id (product exists)', async () => {
    const dto: UpdateProductDto = {
      name: 'Updated name',
    };

    repositoryMock.findOne.mockReturnValueOnce(product);
    repositoryMock.save.mockReturnValue(product);

    await service.update(product.id, dto);

    expect(repositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: product.id },
    });
    expect(repositoryMock.save).toHaveBeenCalledWith({
      ...product,
      ...dto,
    });
  });

  it('should update one product by id (product does not exists)', async () => {
    const dto: UpdateProductDto = {
      name: 'Updated name',
    };

    repositoryMock.findOne.mockReturnValueOnce(null);
    repositoryMock.save.mockReturnValue(product);

    await expect(service.update(product.id, dto)).rejects.toThrow(
      `Product ${product.id} not found`,
    );

    expect(repositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: product.id },
    });
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  const createOrUpdateProduct = async (
    existingProduct: Product,
    product: CreateProductDto,
    expectedMainRepoCalls: number,
    expectedSecondaryRepoCalls: number,
  ) => {
    repositoryMock.findOne.mockReturnValue(existingProduct);

    await service.create(product);

    expect(repositoryMock.save).toHaveBeenCalledTimes(expectedMainRepoCalls);
    expect(secondaryRepositoryMock.save).toHaveBeenCalledTimes(
      expectedSecondaryRepoCalls,
    );
  };
});
