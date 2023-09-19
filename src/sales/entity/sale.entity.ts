import { PriceHistory } from '../../products/entities/price-history.entity';
import { Store } from '../../stores/entities/store.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity({
  name: 'sales',
})
export class Sale {
  @PrimaryColumn()
  id: string;

  @Column()
  date: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @OneToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => PriceHistory, (priceHistory) => priceHistory.sale)
  priceHistory: PriceHistory[];

  static fromJSON(data: any): Sale {
    return {
      id: data.id,
      date: data.date,
      total: parseFloat(data.total),
      store: undefined,
      priceHistory: undefined,
    };
  }
}
