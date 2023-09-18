import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../shared/repository-mock';

describe('StoresService', () => {
  let service: StoresService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
