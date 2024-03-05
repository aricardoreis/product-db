import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MockType,
  repositoryMockFactory,
} from '../../test/mocks/repository.mock';
import { ProductsService } from '../products/products.service';
import { SaleDetails } from '../sales/dto/sale-details.dto';
import { StoresService } from '../stores/stores.service';
import { InvoiceData } from './dto/invoice-data.dto';
import { Sale } from './entity/sale.entity';
import { InvoiceService } from './invoice.service';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  let service: SalesService;
  let repositoryMock: MockType<Repository<Sale>>;

  const invoiceServiceMock = {
    fetchData: jest.fn(),
  };
  const storeServiceMock = {
    create: jest.fn(),
  };
  const productServiceMock = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        SalesService,
        {
          provide: InvoiceService,
          useValue: invoiceServiceMock,
        },
        {
          provide: getRepositoryToken(Sale),
          useFactory: repositoryMockFactory,
        },
        { provide: StoresService, useValue: storeServiceMock },
        { provide: ProductsService, useValue: productServiceMock },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    repositoryMock = module.get(getRepositoryToken(Sale));
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should find a sale', async () => {
    const sale = {
      id: '1234',
      date: new Date(),
      total: 100,
      priceHistory: [],
      store: {
        id: '1234',
        name: 'Test Store',
        address: 'Test Address',
      },
    };

    const createQueryBuilder: any = {
      where: () => createQueryBuilder,
      select: () => createQueryBuilder,
      leftJoin: () => createQueryBuilder,
      cache: () => createQueryBuilder,
      getOne: () => sale,
    };

    repositoryMock.createQueryBuilder.mockReturnValue(createQueryBuilder);

    await expect(service.findOne(sale.id)).resolves.toEqual(
      SaleDetails.fromJSON(sale),
    );
  });

  it('should retrieve items', async () => {
    const totalItems = 123;
    const sales = [
      {
        id: '1',
        date: new Date(),
        total: 100,
        priceHistory: [],
        store: {
          id: '1234',
          name: 'Test Store',
          address: 'Test Address',
        },
      },
    ];
    repositoryMock.findAndCount.mockReturnValue([sales, totalItems]);

    const paginationOptions = {
      limit: 5,
      page: 1,
    };
    const [items, total] = await service.findAll(paginationOptions);

    expect(items.length).toEqual(sales.length);
    expect(total).toEqual(totalItems);

    expect(repositoryMock.findAndCount).toHaveBeenCalledWith({
      take: paginationOptions.limit,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      order: { date: 'DESC' },
    });
  });

  it('should create a sale when no sale exists', async () => {
    const url = 'url';
    const invoiceData: InvoiceData = {
      store: {
        id: 'STORE_ID',
        name: 'Test Store',
        address: 'Test Address',
      },
      sale: {
        id: 'SALE_ID',
        total: 100,
        date: '2024-01-01',
      },
      products: [
        {
          name: 'PRODUCT_NAME',
          value: 29.99,
          code: '1324567890',
          amount: 0.8,
          type: 'Kg',
          date: '2024-01-01',
        },
        {
          name: 'PRODUCT_NAME_2',
          value: 59.98,
          code: '13245678901',
          amount: 1,
          type: 'Un',
          date: '2024-01-01',
        },
      ],
    };

    invoiceServiceMock.fetchData.mockReturnValue(Promise.resolve(invoiceData));
    repositoryMock.findOne.mockReturnValueOnce(null);
    storeServiceMock.create.mockReturnValue(
      Promise.resolve({ ...invoiceData.store }),
    );

    const saleId = await service.create(url);

    expect(saleId).toEqual(invoiceData.sale.id);
    expect(repositoryMock.save).toHaveBeenCalledWith({
      ...invoiceData.sale,
      invoiceUrl: url,
      store: invoiceData.store,
    });
    expect(productServiceMock.create).toHaveBeenCalledTimes(
      invoiceData.products.length,
    );
    expect(storeServiceMock.create).toHaveBeenCalledWith(invoiceData.store);
  });

  it('it should throw an error when a sale already exists', async () => {
    const invoiceData = {
      sale: {
        id: 'SALE_ID',
      },
    };

    invoiceServiceMock.fetchData.mockReturnValue(Promise.resolve(invoiceData));
    repositoryMock.findOne.mockReturnValueOnce({ id: 'SALE_ID' });

    await expect(service.create('url')).rejects.toThrow('Sale already exists');
  });
});
