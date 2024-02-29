import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MockType,
  repositoryMockFactory,
} from '../../test/mocks/repository.mock';
import { CreateStoreDto } from './dto/create-store.dto';
import { Store } from './entities/store.entity';
import { StoresService } from './stores.service';

describe('StoresService', () => {
  let service: StoresService;
  let repositoryMock: MockType<Repository<Store>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: getRepositoryToken(Store),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    repositoryMock = module.get(getRepositoryToken(Store));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a store', async () => {
    const store: Store = {
      id: '1234567890',
      name: 'Test Store',
      address: 'Test Address',
    };

    repositoryMock.findOne.mockReturnValue(store);

    await expect(service.findOne(store.id)).resolves.toEqual(store);
  });

  it('should find all stores', async () => {
    const stores = [
      {
        id: '1234567890',
        name: 'Test Store',
        address: 'Test Address',
      },
    ];

    repositoryMock.find.mockReturnValue(stores);

    const items = await service.findAll();

    expect(items.length).toEqual(stores.length);
  });

  it('should create a store', async () => {
    const store: CreateStoreDto = {
      id: '1234567890',
      name: 'Test Store',
      address: 'Test Address',
    };
    const savedStore: Store = {
      ...store,
    };

    repositoryMock.save.mockReturnValue(savedStore);

    await expect(service.create(store)).resolves.toEqual(store);
  });
});
