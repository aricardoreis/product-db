import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { InvoiceService } from './invoice.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { StoresService } from '../stores/stores.service';

describe('SalesService', () => {
  let service: SalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot()],
      providers: [
        {
          provide: SalesService,
          useValue: {},
        },
        {
          provide: InvoiceService,
          useValue: {},
        },
        {
          provide: StoresService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });
});
