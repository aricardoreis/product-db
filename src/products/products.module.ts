import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { PriceHistory } from './entities/price-history.entity';
import { DeduplicationService } from './deduplication.service';
import { DeduplicationController } from './deduplication.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, PriceHistory])],
  controllers: [DeduplicationController, ProductsController],
  providers: [ProductsService, DeduplicationService],
  exports: [ProductsService, DeduplicationService],
})
export class ProductsModule {}
