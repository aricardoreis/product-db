import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async findAll(): Promise<Store[]> {
    return this.storesService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Store> {
    return this.storesService.findOne(id);
  }

  @Post()
  async create(@Body() store: CreateStoreDto): Promise<Store> {
    return this.storesService.create(store);
  }
}
