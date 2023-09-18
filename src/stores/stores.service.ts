import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
  ) {}

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      take: 10,
    });
  }

  async findOne(id: string): Promise<Store> {
    return this.storeRepository.findOne({
      where: { id },
    });
  }

  async create(store: CreateStoreDto): Promise<Store> {
    return this.storeRepository.save(store);
  }
}
