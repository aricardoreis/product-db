import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { StoresService } from '../stores/stores.service';
import { InvoiceData } from './dto/invoice-data.dto';
import { Sale } from './entity/sale.entity';
import { InvoiceService } from './invoice.service';
import { SaleDetails } from './dto/sale-details.dto';

@Injectable()
export class SalesService {
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

  async findAll(): Promise<Sale[]> {
    const sales = await this.saleRepository.find({
      take: 10,
    });
    return sales.map((sale) => Sale.fromJSON(sale));
  }

  async create(url: string): Promise<InvoiceData> {
    const invoiceData = await this.invoiceService.fetchData(url);

    // check if sale exists
    const sale = await this.saleRepository.findOne({
      where: { id: invoiceData.sale.id },
    });

    if (sale) {
      throw new Error('Sale already exists');
    }

    const store = await this.storesService.create(invoiceData.store);
    await this.saleRepository.save({ ...invoiceData.sale, store: store });

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

    return invoiceData;
  }

  private async fetchInvoiceData(url: string): Promise<any> {
    return this.invoiceService.fetchData(url);
  }
}
