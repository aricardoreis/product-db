import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoresController } from './stores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  providers: [StoresService],
  controllers: [StoresController],
  exports: [StoresService],
})
export class StoresModule {}
