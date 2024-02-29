import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { InvoiceData } from './dto/invoice-data.dto';
import { InvoiceService } from './invoice.service';

const PRODUCT_DB_DATA = {
  success: true,
  result: {
    store: {
      id: '15459431001240',
      name: 'SERTAO COMERCIAL DE EQUIPAMENTOS LTDA',
      storeAddress:
        'MASCARENHAS DE MORAES, 2470, LOJA 6, MONTE CASTELO, CAMPO GRANDE, MS',
    },
    sale: {
      id: '50220615459431001240650190000904721722454514',
      total: 89.9,
      date: 1655683200000,
    },
    products: [
      {
        name: 'TORNEIRA FILTRO PAR ACQUA DUE LORENZETTI BRANCO .',
        value: 129.9,
        code: '1203547',
        amount: 1,
        type: 'PC',
        date: 1655683200000,
      },
    ],
  },
};

describe('InvoiceService', () => {
  let service: InvoiceService;

  const httpServiceMock = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch data', async () => {
    const url = 'https://example.com';
    const response: AxiosResponse<any> = {
      data: PRODUCT_DB_DATA,
      headers: {},
      config: {
        url: url,
        headers: undefined,
      },
      status: 200,
      statusText: 'OK',
    };

    httpServiceMock.post.mockImplementationOnce(() => of(response));

    const data = await service.fetchData(url);

    expect(data).toEqual(InvoiceData.fromJSON(PRODUCT_DB_DATA.result));
  });
});
