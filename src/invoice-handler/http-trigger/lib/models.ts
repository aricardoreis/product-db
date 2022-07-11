export interface Product {
  name: string;
  value: number;
}

export interface Item {
  product: Product;
  total: number;
  code: number;
  quantity: number;
  type: ItemType;
}

export enum ItemType {
  Unit,
  Piece,
  Kilo,
}

export interface Store {
  name: string;
  address: string;
}

export class Sale {
  constructor() {
    this.products = [];
  }
  id: number;
  store: Store;
  products: Item[];
  itemsCount: number;
  total: number;
  date: Date;
  accessKey: string;
}
