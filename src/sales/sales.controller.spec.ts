import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { InvoiceService } from './invoice.service';
import { SalesService } from './sales.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { StoresService } from '../stores/stores.service';

describe('SalesController', () => {
  let controller: SalesController;

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
      controllers: [SalesController],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
