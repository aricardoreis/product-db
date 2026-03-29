import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { DeduplicationService } from './deduplication.service';
import { MergeProductsDto } from './dto/merge-products.dto';
import { TransformInterceptor } from '../shared/transform-interceptor';

@Controller('products')
@UseInterceptors(TransformInterceptor)
export class DeduplicationController {
  constructor(private readonly deduplicationService: DeduplicationService) {}

  @Get('duplicates')
  async findDuplicates(
    @Query('threshold') threshold?: string,
    @Query('search') search?: string,
  ) {
    console.log(
      'Finding duplicates with threshold:',
      threshold,
      'and search:',
      search,
    );
    const t = threshold ? parseFloat(threshold) : undefined;
    return this.deduplicationService.findDuplicateClusters(t, search);
  }

  @Post('merge')
  async merge(@Body() dto: MergeProductsDto) {
    return this.deduplicationService.mergeProducts(
      dto.canonicalId,
      dto.duplicateIds,
    );
  }
}
