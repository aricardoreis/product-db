import { Controller, Get, Param, Query } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() { limit, page, keyword = '' },
  ): Promise<[Product[], number]> {
    return this.productsService.findAll({
      limit,
      page,
      keyword,
    });
  }

  @Get('/:id')
  async findOne(@Param('id') id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }
}
