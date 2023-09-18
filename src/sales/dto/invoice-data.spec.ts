import { InvoiceData } from './invoice-data.dto';

const invoiceData = {
  store: {
    id: '09477652011473',
    name: 'SDB COMERCIO DE ALIMENTOS LTDA',
    storeAddress: 'Rua R Ceara, 1553, , Jardim dos Estados, CAMPO GRANDE, MS',
  },
  sale: {
    id: '50221209477652011473651070001552951001166328',
    total: 33.86,
    date: 1671062400000,
  },
  products: [
    {
      name: 'CHOC LACTA 45G BIS XT OR',
      value: 2.99,
      code: '7622300988517',
      amount: 1,
      type: 'UN',
    },
    {
      name: 'CHOC LACTA BIS 45G CHOC',
      value: 2.99,
      code: '7622210566409',
      amount: 1,
      type: 'UN',
    },
    {
      name: 'SALG MILHO DORITOS 140G',
      value: 9.9,
      code: '7892840814540',
      amount: 1,
      type: 'UN',
    },
    {
      name: 'SALG FANDANGOS 140G QJO',
      value: 8.99,
      code: '7892840816339',
      amount: 1,
      type: 'UN',
    },
    {
      name: 'SALG CHEETOS 140G REQ',
      value: 8.99,
      code: '7892840816261',
      amount: 1,
      type: 'UN',
    },
  ],
};

describe('InvoiceData', () => {
  it('should be defined', () => {
    expect(invoiceData).toBeDefined();
  });

  it('should be equal', () => {
    const data = InvoiceData.fromJSON(invoiceData);

    console.log(`data: ${JSON.stringify(data)}`);

    expect(data.store).toEqual(invoiceData.store);
    expect(data.sale.date).toEqual(new Date(invoiceData.sale.date));
    expect(data.products.length).toEqual(invoiceData.products.length);
    data.products.forEach((product, index) => {
      expect(product).toEqual(invoiceData.products[index]);
    });
  });
});
