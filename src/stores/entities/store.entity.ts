import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'stores',
})
export class Store {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;
}
