import { Test, TestingModule } from '@nestjs/testing';
import { serviceMock } from './../../test/mocks';
import { CreateStoreDto } from './dto/create-store.dto';
import { Store } from './entities/store.entity';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

const store: Store = {
  id: '1234',
  name: 'Test Store',
  address: 'Test address',
};

describe('StoresController', () => {
  let controller: StoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: StoresService,
          useValue: serviceMock,
        },
      ],
      controllers: [StoresController],
    }).compile();

    controller = module.get<StoresController>(StoresController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should retrieve one store by id', async () => {
    serviceMock.findOne.mockReturnValue(store);

    expect(await controller.findOne('1234')).toEqual(store);
  });

  it('should retrieve all stores', async () => {
    const storeList: Store[] = [store, store];
    serviceMock.findAll.mockReturnValue(storeList);

    const result = await controller.findAll();

    expect(result.length).toEqual(storeList.length);
  });

  it('should create a new store', async () => {
    const storeToBeCreated: CreateStoreDto = {
      ...store,
    };
    serviceMock.create.mockReturnValue(store);

    const result = await controller.create(storeToBeCreated);

    expect(result).toHaveProperty('id', store.id);
  });
});
