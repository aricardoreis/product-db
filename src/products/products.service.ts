import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { PriceHistory } from './entities/price-history.entity';
import { PaginationOptions } from 'src/paginate';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(PriceHistory)
    private priceHistoryRepository: Repository<PriceHistory>,
  ) {}

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
      relations: {
        priceHistory: true,
      },
    });
  }

  async findAll(options: PaginationOptions): Promise<[Product[], number]> {
    const [products, total] = await this.productRepository
      .createQueryBuilder('product')
      .take(options.limit)
      .skip((options.page - 1) * options.limit)
      .select([
        'product.id',
        'product.name',
        'product.type',
        'product.code',
        'product.amount',
        'priceHistory.date',
        'priceHistory.value',
      ])
      .leftJoin('product.priceHistory', 'priceHistory')
      .getManyAndCount();

    this.logger.log(`Found ${total} products. Got ${products.length} items.`);

    return [products.map((product) => Product.fromJSON(product)), total];
  }

  async findByCode(code: string): Promise<Product> {
    return this.productRepository.findOne({
      where: { code },
      relations: {
        priceHistory: true,
      },
    });
  }

  async create(product: CreateProductDto): Promise<Product> {
    let result: Product = null;

    const existingProduct = await this.findByCode(product.code);
    const shouldUpdate = existingProduct && existingProduct.isEan;
    if (shouldUpdate) {
      // update existing one, adding a new price history
      const newPriceHistory = {
        value: product.value,
        date: product.date,
        product: existingProduct,
        sale_id: product.saleId,
      };
      await this.priceHistoryRepository.save(newPriceHistory);
      result = existingProduct;
    } else {
      // create new product on database
      const newProduct: Product = {
        id: undefined,
        ...product,
        isEan: this.hasEANCode(product),
        priceHistory: [],
      };
      result = await this.productRepository.save(newProduct);

      // create new price history
      const newPriceHistory = {
        value: product.value,
        date: product.date,
        product: newProduct,
        sale_id: product.saleId,
      };
      await this.priceHistoryRepository.save(newPriceHistory);
    }

    return result;
  }

  private hasEANCode(product: CreateProductDto): boolean {
    return product.code.length === 13 || product.code.length === 8;
  }
}
