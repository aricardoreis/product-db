import { Test, TestingModule } from '@nestjs/testing';
import { PaginationOptions } from 'src/paginate';
import { serviceMock } from './../../test/mocks';
import { CreateSaleDto } from './dto/create-sale-dto';
import { Sale } from './entity/sale.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

const sale: Sale = {
  id: '1234567890',
  date: new Date(),
  store: {
    id: '1234',
    name: 'Test Store',
    address: 'Test address',
  },
  invoiceUrl: 'https://test.com',
  total: 100,
  priceHistory: [],
};

describe('SalesController', () => {
  let controller: SalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SalesService,
          useValue: serviceMock,
        },
      ],
      controllers: [SalesController],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should retrieve one sale by id', async () => {
    serviceMock.findOne.mockReturnValue(sale);

    expect(await controller.findOne('')).toEqual(sale);
  });

  it('should retrieve all sales', async () => {
    const saleList: Sale[] = [sale, sale];
    serviceMock.findAll.mockReturnValue(saleList);

    const options: PaginationOptions = {
      limit: 10,
      page: 1,
    };
    const result = await controller.findAll(options);

    expect(result.length).toEqual(saleList.length);
    expect(serviceMock.findAll).toHaveBeenCalledWith(options);
  });

  it('should create a new sale', async () => {
    const saleToBeCreated: CreateSaleDto = {
      url: 'https://test.com',
    };
    serviceMock.create.mockReturnValue(sale);

    const result = await controller.create(saleToBeCreated);

    expect(result).toHaveProperty('id', sale.id);
    expect(serviceMock.create).toHaveBeenCalledWith(saleToBeCreated.url);
  });
});
