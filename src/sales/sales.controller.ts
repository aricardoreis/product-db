import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { Sale } from './entity/sale.entity';
import { CreateSaleDto } from './dto/create-sale-dto';
import { SaleDetails } from './dto/sale-details.dto';
import { Public } from 'src/decorators/public.decorator';
import { TransformInterceptor } from 'src/shared/transform-interceptor';

@Controller('sales')
@UseInterceptors(TransformInterceptor)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Public()
  @Get()
  async findAll(@Query() { limit, page }): Promise<[Sale[], number]> {
    return this.salesService.findAll({ limit, page });
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<SaleDetails> {
    return this.salesService.findOne(id);
  }

  @Post()
  async create(@Body() createSaleDto: CreateSaleDto): Promise<string> {
    return this.salesService.create(createSaleDto.url);
  }
}
