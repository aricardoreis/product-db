import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Sale } from '../../sales/entity/sale.entity';

@Entity({
  name: 'price_history',
})
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value: number;

  @Column()
  date: Date;

  @Column()
  sale_id: string;

  @ManyToOne(() => Sale)
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  static fromJson(data: any): PriceHistory {
    return {
      id: data.id,
      value: parseFloat(data.value),
      date: data.date,
      sale_id: data.sale_id,
      sale: data.sale,
      product: data.product,
    };
  }
}
