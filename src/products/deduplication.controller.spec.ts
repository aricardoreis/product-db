import { Test, TestingModule } from '@nestjs/testing';
import { DeduplicationController } from './deduplication.controller';
import {
  DeduplicationService,
  DuplicateCluster,
} from './deduplication.service';

const mockClusters: DuplicateCluster[] = [
  {
    clusterId: 1,
    products: [
      {
        id: 1,
        name: 'ABACAXI PEROLA KG',
        code: '001',
        isEan: false,
        priceHistoryCount: 3,
      },
      {
        id: 2,
        name: 'ABACAXI PEROLA',
        code: '002',
        isEan: false,
        priceHistoryCount: 5,
      },
    ],
  },
];

describe('DeduplicationController', () => {
  let controller: DeduplicationController;
  let service: DeduplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeduplicationController],
      providers: [
        {
          provide: DeduplicationService,
          useValue: {
            findDuplicateClusters: jest.fn(),
            mergeProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeduplicationController>(DeduplicationController);
    service = module.get<DeduplicationService>(DeduplicationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findDuplicates', () => {
    it('should return clusters with default threshold', async () => {
      jest
        .spyOn(service, 'findDuplicateClusters')
        .mockResolvedValue(mockClusters);

      const result = await controller.findDuplicates();

      expect(result).toEqual(mockClusters);
      expect(service.findDuplicateClusters).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });

    it('should pass custom threshold', async () => {
      jest.spyOn(service, 'findDuplicateClusters').mockResolvedValue([]);

      await controller.findDuplicates('0.6');

      expect(service.findDuplicateClusters).toHaveBeenCalledWith(
        0.6,
        undefined,
      );
    });

    it('should pass search term', async () => {
      jest
        .spyOn(service, 'findDuplicateClusters')
        .mockResolvedValue(mockClusters);

      await controller.findDuplicates(undefined, 'abacaxi');

      expect(service.findDuplicateClusters).toHaveBeenCalledWith(
        undefined,
        'abacaxi',
      );
    });
  });

  describe('merge', () => {
    it('should call mergeProducts with dto values', async () => {
      jest.spyOn(service, 'mergeProducts').mockResolvedValue({ merged: 2 });

      const result = await controller.merge({
        canonicalId: 1,
        duplicateIds: [2, 3],
      });

      expect(result).toEqual({ merged: 2 });
      expect(service.mergeProducts).toHaveBeenCalledWith(1, [2, 3]);
    });
  });
});
