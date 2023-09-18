import { StoreData } from './invoice-data.dto';

export class SaleDetails {
  id: string;
  date: string;
  total: number;
  products: ProductDetails[];
  store: StoreData;

  static fromJSON(data: any): SaleDetails {
    return {
      id: data.id,
      date: data.date,
      total: parseFloat(data.total),
      products: data.priceHistory.map(ProductDetails.fromJSON),
      store: StoreData.fromJSON(data.store),
    };
  }
}

class ProductDetails {
  name: string;
  value: number;
  code: string;
  amount: number;
  type: string;

  static fromJSON(data: any): ProductDetails {
    return {
      name: data.product.name,
      value: parseFloat(data.value),
      code: data.product.code,
      amount: data.product.amount,
      type: data.product.type,
    };
  }
}
