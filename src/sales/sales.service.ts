import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { StoresService } from '../stores/stores.service';
import { Sale } from './entity/sale.entity';
import { InvoiceService } from './invoice.service';
import { SaleDetails } from './dto/sale-details.dto';
import { PaginationOptions } from 'src/paginate';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Sale) private saleRepository: Repository<Sale>,
    private readonly invoiceService: InvoiceService,
    private readonly storesService: StoresService,
    private readonly productsService: ProductsService,
  ) {}

  async findOne(id: string): Promise<SaleDetails> {
    const sale = await this.saleRepository
      .createQueryBuilder('sale')
      .where({ id: id })
      .select([
        'sale.id',
        'sale.date',
        'sale.total',
        'store.name',
        'store.address',
        'priceHistory.value',
        'product.name',
        'product.code',
        'product.amount',
        'product.type',
      ])
      .leftJoin('sale.priceHistory', 'priceHistory')
      .leftJoin('priceHistory.product', 'product')
      .leftJoin('sale.store', 'store')
      .cache(true)
      .getOne();
    return SaleDetails.fromJSON(sale);
  }

  async findAll(options: PaginationOptions): Promise<[Sale[], number]> {
    const [data, total] = await this.saleRepository.findAndCount({
      take: options.limit,
      skip: (options.page - 1) * options.limit,
      order: { date: 'DESC' },
    });

    this.logger.log(`Found ${total} sales. Got ${data.length} items.`);

    return [data.map((sale) => Sale.fromJSON(sale)), total];
  }

  async create(url: string): Promise<string> {
    this.logger.log('Loading invoice data', url);

    try {
      const invoiceData = await this.invoiceService.fetchData(url);

      this.logger.log(`Invoice data loaded: ${JSON.stringify(invoiceData)}`);

      // check if sale exists
      const sale = await this.saleRepository.findOne({
        where: { id: invoiceData.sale.id },
      });

      if (sale) {
        this.logger.warn('Sale already exists');
        throw new Error('Sale already exists');
      }

      const store = await this.storesService.create(invoiceData.store);

      this.logger.log(`Store created/updated: ${store.name}`);

      await this.saleRepository.save({
        ...invoiceData.sale,
        store: store,
        invoiceUrl: url,
      });

      this.logger.log(`Sale created with id: ${invoiceData.sale.id}`);

      // create products
      await Promise.all(
        invoiceData.products.map(
          async (product) =>
            await this.productsService.create({
              ...product,
              saleId: invoiceData.sale.id,
            }),
        ),
      );

      this.logger.log(`Products created: ${invoiceData.products.length}`);

      return invoiceData.sale.id;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
