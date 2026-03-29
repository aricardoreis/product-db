import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { DeduplicationService } from './deduplication.service';
import { getLoggerToken } from 'nestjs-pino';

const mockLogger = {
  assign: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('DeduplicationService', () => {
  let service: DeduplicationService;
  let productRepoMock: Record<string, jest.Mock>;
  let dataSourceMock: { transaction: jest.Mock };

  beforeEach(async () => {
    dataSourceMock = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeduplicationService,
        {
          provide: getLoggerToken(DeduplicationService.name),
          useValue: mockLogger,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            query: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<DeduplicationService>(DeduplicationService);
    productRepoMock = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findDuplicateClusters', () => {
    it('should return empty array when no similar pairs found', async () => {
      dataSourceMock.transaction.mockImplementation(async (cb) => {
        const manager = { query: jest.fn().mockResolvedValue([]) };
        return cb(manager);
      });

      const result = await service.findDuplicateClusters();

      expect(result).toEqual([]);
    });

    it('should group pairs into clusters using connected components', async () => {
      // A≈B, B≈C → cluster {A, B, C}; D≈E → cluster {D, E}
      dataSourceMock.transaction.mockImplementation(async (cb) => {
        const manager = {
          query: jest
            .fn()
            .mockResolvedValueOnce(undefined) // SET LOCAL threshold
            .mockResolvedValueOnce([
              { idA: 1, idB: 2, similarity: 0.8 },
              { idA: 2, idB: 3, similarity: 0.5 },
              { idA: 10, idB: 20, similarity: 0.6 },
            ]),
        };
        return cb(manager);
      });

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
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
          {
            id: 3,
            name: 'ABACAXI PEROLA UN',
            code: '003',
            isEan: false,
            priceHistoryCount: 1,
          },
          {
            id: 10,
            name: 'LEITE INTEGRAL',
            code: '010',
            isEan: false,
            priceHistoryCount: 2,
          },
          {
            id: 20,
            name: 'LEITE INTEGRAL LT',
            code: '020',
            isEan: false,
            priceHistoryCount: 4,
          },
        ]),
      };
      productRepoMock.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findDuplicateClusters();

      expect(result).toHaveLength(2);

      const abacaxiCluster = result.find((c) =>
        c.products.some((p) => p.name.includes('ABACAXI')),
      );
      expect(abacaxiCluster.products).toHaveLength(3);
      expect(abacaxiCluster.products.map((p) => p.id).sort()).toEqual([
        1, 2, 3,
      ]);

      const leiteCluster = result.find((c) =>
        c.products.some((p) => p.name.includes('LEITE')),
      );
      expect(leiteCluster.products).toHaveLength(2);
      expect(leiteCluster.products.map((p) => p.id).sort()).toEqual([10, 20]);
    });

    it('should use custom threshold when provided', async () => {
      let capturedManager: Record<string, jest.Mock>;
      dataSourceMock.transaction.mockImplementation(async (cb) => {
        capturedManager = { query: jest.fn().mockResolvedValue([]) };
        return cb(capturedManager);
      });

      await service.findDuplicateClusters(0.7);

      expect(capturedManager.query).toHaveBeenCalledWith(
        'SET LOCAL pg_trgm.similarity_threshold = $1',
        [0.7],
      );
    });

    it('should filter by search term when provided', async () => {
      let capturedManager: Record<string, jest.Mock>;
      dataSourceMock.transaction.mockImplementation(async (cb) => {
        capturedManager = {
          query: jest
            .fn()
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce([]),
        };
        return cb(capturedManager);
      });

      await service.findDuplicateClusters(0.4, 'abacaxi');

      expect(capturedManager.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        ['%abacaxi%'],
      );
    });
  });

  describe('mergeProducts', () => {
    it('should throw NotFoundException when canonical product not found', async () => {
      productRepoMock.findOne.mockResolvedValue(null);

      await expect(service.mergeProducts(999, [1, 2])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when some duplicate products not found', async () => {
      productRepoMock.findOne.mockResolvedValue({
        id: 1,
        name: 'Canonical',
        isEan: false,
      });

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 2 }]),
      };
      productRepoMock.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.mergeProducts(1, [2, 3])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should merge duplicates into canonical via transaction', async () => {
      const canonical = { id: 1, name: 'ABACAXI', code: '001', isEan: false };
      const duplicates = [
        { id: 2, name: 'ABACAXI KG', code: '002', isEan: false },
        { id: 3, name: 'ABACAXI UN', code: '003', isEan: false },
      ];

      productRepoMock.findOne.mockResolvedValue(canonical);
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(duplicates),
      };
      productRepoMock.createQueryBuilder.mockReturnValue(queryBuilder);

      const mockManager = { query: jest.fn() };
      dataSourceMock.transaction.mockImplementation(async (cb) =>
        cb(mockManager),
      );

      const result = await service.mergeProducts(1, [2, 3]);

      expect(result).toEqual({ merged: 2 });
      // Reassign FKs
      expect(mockManager.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE price_history'),
        [1, [2, 3]],
      );
      // Delete duplicates
      expect(mockManager.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM products'),
        [[2, 3]],
      );
    });

    it('should promote EAN from duplicate to canonical when canonical lacks EAN', async () => {
      const canonical = { id: 1, name: 'ABACAXI', code: '001', isEan: false };
      const duplicates = [
        { id: 2, name: 'ABACAXI', code: '7891000315507', isEan: true },
      ];

      productRepoMock.findOne.mockResolvedValue(canonical);
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(duplicates),
      };
      productRepoMock.createQueryBuilder.mockReturnValue(queryBuilder);

      const mockManager = { query: jest.fn() };
      dataSourceMock.transaction.mockImplementation(async (cb) =>
        cb(mockManager),
      );

      await service.mergeProducts(1, [2]);

      // Should promote the EAN
      expect(mockManager.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products SET code'),
        ['7891000315507', 1],
      );
    });
  });
});
