import { Controller, Get } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get()
  getProducts(): any[] {
    return ['Product 1', 'Product 2'];
  }
}
