import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Sale } from './entity/sale.entity';
import { CreateSaleDto } from './dto/create-sale-dto';
import { SaleDetails } from './dto/sale-details.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll(): Promise<Sale[]> {
    return this.salesService.findAll();
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
