import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

describe('StoresController', () => {
  let controller: StoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: StoresService,
          useValue: {},
        },
      ],
      controllers: [StoresController],
    }).compile();

    controller = module.get<StoresController>(StoresController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });
});
