import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PriceHistory } from './price-history.entity';

@Entity({
  name: 'products',
})
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  amount: number;

  @Column()
  type: string;

  @Column({ name: 'is_ean' })
  isEan: boolean;

  @OneToMany(() => PriceHistory, (priceHistory) => priceHistory.product)
  priceHistory: PriceHistory[];

  static fromJSON(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      amount: data.amount,
      type: data.type,
      isEan: undefined,
      priceHistory: data.priceHistory.map((priceHistory) =>
        PriceHistory.fromJson(priceHistory),
      ),
    };
  }
}
