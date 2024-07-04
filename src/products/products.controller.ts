import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  SortingParam,
  SortingParams,
} from '../decorators/sorting-params.decorator';
import { TransformInterceptor } from '../shared/transform-interceptor';

@Controller('products')
@UseInterceptors(TransformInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() { limit, page, keyword = '' },
    @SortingParams(['name', 'id'])
    sort?: SortingParam,
  ): Promise<[Product[], number]> {
    return this.productsService.findAll(
      {
        limit,
        page,
        keyword,
      },
      sort,
    );
  }

  @Get('/:id')
  async findOne(@Param('id') id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(+id, updateProductDto);
  }
}
