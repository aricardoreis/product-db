import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PriceHistory } from './entities/price-history.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { isValidEAN } from './ean.utils';

interface SimilarPair {
  idA: number;
  idB: number;
  similarity: number;
}

export interface ClusterProduct {
  id: number;
  name: string;
  code: string;
  isEan: boolean;
  priceHistoryCount: number;
}

export interface DuplicateCluster {
  clusterId: number;
  products: ClusterProduct[];
}

@Injectable()
export class DeduplicationService {
  constructor(
    @InjectPinoLogger(DeduplicationService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async findDuplicateClusters(
    threshold = 0.4,
    search?: string,
  ): Promise<DuplicateCluster[]> {
    // Set threshold for the % operator so the GIN index is used
    await this.productRepository.query(
      `SET pg_trgm.similarity_threshold = ${Number(threshold)}`,
    );

    const params: string[] = [];
    let searchFilter = '';

    if (search) {
      params.push(`%${search}%`);
      searchFilter = `AND (a.name ILIKE $1 OR b.name ILIKE $1)`;
    }

    const pairs: SimilarPair[] = await this.productRepository.query(
      `SELECT a.id AS "idA", b.id AS "idB",
              similarity(a.name, b.name) AS "similarity"
       FROM products a
       JOIN products b ON a.id < b.id AND a.name % b.name
       WHERE true ${searchFilter}
       ORDER BY similarity(a.name, b.name) DESC`,
      params,
    );

    if (pairs.length === 0) return [];

    // Collect all product IDs involved in pairs
    const productIds = new Set<number>();
    for (const pair of pairs) {
      productIds.add(pair.idA);
      productIds.add(pair.idB);
    }

    // Build clusters via Union-Find
    const parent = new Map<number, number>();

    const find = (x: number): number => {
      if (!parent.has(x)) parent.set(x, x);
      if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
      return parent.get(x);
    };

    const union = (a: number, b: number): void => {
      const rootA = find(a);
      const rootB = find(b);
      if (rootA !== rootB) parent.set(rootA, rootB);
    };

    for (const pair of pairs) {
      union(pair.idA, pair.idB);
    }

    // Group by root
    const clusterMap = new Map<number, number[]>();
    for (const id of productIds) {
      const root = find(id);
      if (!clusterMap.has(root)) clusterMap.set(root, []);
      clusterMap.get(root).push(id);
    }

    // Fetch product details + price history count
    const allIds = [...productIds];
    const products: (Product & { priceHistoryCount: number })[] =
      await this.productRepository
        .createQueryBuilder('p')
        .select([
          'p.id AS "id"',
          'p.name AS "name"',
          'p.code AS "code"',
          'p.is_ean AS "isEan"',
          'COUNT(ph.id)::int AS "priceHistoryCount"',
        ])
        .leftJoin(PriceHistory, 'ph', 'ph.product_id = p.id')
        .where('p.id IN (:...ids)', { ids: allIds })
        .groupBy('p.id')
        .getRawMany();

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Build response
    const clusters: DuplicateCluster[] = [];
    let clusterId = 1;
    for (const memberIds of clusterMap.values()) {
      if (memberIds.length < 2) continue;
      clusters.push({
        clusterId: clusterId++,
        products: memberIds
          .map((id) => productMap.get(id))
          .filter(Boolean)
          .map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            isEan: p.isEan,
            priceHistoryCount: p.priceHistoryCount,
          })),
      });
    }

    this.logger.assign({
      _dedup: {
        pairs: pairs.length,
        clusters: clusters.length,
        threshold,
        search: search ?? null,
      },
    });

    return clusters;
  }

  async mergeProducts(
    canonicalId: number,
    duplicateIds: number[],
  ): Promise<{ merged: number }> {
    // Validate canonical exists
    const canonical = await this.productRepository.findOne({
      where: { id: canonicalId },
    });
    if (!canonical) {
      throw new Error(`Canonical product ${canonicalId} not found`);
    }

    // Validate duplicates exist
    const duplicates = await this.productRepository
      .createQueryBuilder('p')
      .where('p.id IN (:...ids)', { ids: duplicateIds })
      .getMany();

    if (duplicates.length !== duplicateIds.length) {
      const foundIds = duplicates.map((d) => d.id);
      const missing = duplicateIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Duplicate products not found: ${missing.join(', ')}`);
    }

    // Check if any duplicate has a valid EAN that the canonical lacks
    const eanDonor = duplicates.find(
      (d) => d.isEan && isValidEAN(d.code) && !canonical.isEan,
    );

    await this.dataSource.transaction(async (manager) => {
      // Reassign price history FKs
      await manager.query(
        `UPDATE price_history SET product_id = $1 WHERE product_id = ANY($2)`,
        [canonicalId, duplicateIds],
      );

      // If a duplicate has a valid EAN, promote it to the canonical
      if (eanDonor) {
        await manager.query(
          `UPDATE products SET code = $1, is_ean = true WHERE id = $2`,
          [eanDonor.code, canonicalId],
        );
      }

      // Delete duplicates
      await manager.query(`DELETE FROM products WHERE id = ANY($1)`, [
        duplicateIds,
      ]);
    });

    this.logger.assign({
      _merge: {
        canonicalId,
        duplicateIds,
        eanPromoted: eanDonor?.code ?? null,
      },
    });

    return { merged: duplicateIds.length };
  }
}
