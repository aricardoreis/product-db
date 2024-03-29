import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { InvoiceService } from './invoice.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { StoresModule } from '../stores/stores.module';
import { ProductsModule } from '../products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entity/sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale]),
    ConfigModule.forRoot(),
    HttpModule,
    StoresModule,
    ProductsModule,
  ],
  providers: [SalesService, InvoiceService],
  controllers: [SalesController],
})
export class SalesModule {}
