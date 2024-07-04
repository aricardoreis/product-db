import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { TransformInterceptor } from '../shared/transform-interceptor';
import { Public } from '../decorators/public.decorator';

@Controller('stores')
@UseInterceptors(TransformInterceptor)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Public()
  @Get()
  async findAll(): Promise<Store[]> {
    return this.storesService.findAll();
  }

  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Store> {
    return this.storesService.findOne(id);
  }

  @Post()
  async create(@Body() store: CreateStoreDto): Promise<Store> {
    return this.storesService.create(store);
  }
}
