export class InvoiceData {
  store: StoreData;
  sale: SaleData;
  products: ProductData[];

  static fromJSON(data: any): InvoiceData {
    return {
      store: StoreData.fromJSON(data.store),
      sale: SaleData.fromJSON(data.sale),
      products: data.products.map(ProductData.fromJSON),
    };
  }
}

export class StoreData {
  id: string;
  name: string;
  address: string;

  static fromJSON(data: any): StoreData {
    return {
      id: data.id,
      name: data.name,
      address: data.storeAddress ?? data.address,
    };
  }
}

class SaleData {
  id: string;
  total: number;
  date: string;

  static fromJSON(data: any): SaleData {
    return {
      id: data.id,
      total: data.total,
      date: new Date(data.date).toISOString().split('T')[0],
    };
  }
}

class ProductData {
  name: string;
  value: number;
  code: string;
  amount: number;
  type: string;
  date: string;

  static fromJSON(data: any): ProductData {
    return {
      name: data.name,
      value: data.value,
      code: data.code,
      amount: data.amount,
      type: data.type,
      date: new Date(data.date).toISOString().split('T')[0],
    };
  }
}
