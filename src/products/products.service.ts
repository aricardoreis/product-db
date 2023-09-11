import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      take: 10,
    });
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
      relations: {
        priceHistory: true,
      },
    });
  }

  async create(product: CreateProductDto): Promise<Product> {
    return this.productRepository.save(product);
  }
}
