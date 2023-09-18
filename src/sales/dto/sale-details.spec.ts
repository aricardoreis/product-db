import { SaleDetails } from './sale-details.dto';

const saleDetails = {
  id: '50221209477652011473651070001552951001166328',
  date: '2022-12-15T03:00:00.000Z',
  total: '33.86',
  priceHistory: [
    {
      value: '2.99',
      product: {
        name: 'CHOC LACTA 45G BIS XT OR',
        code: '7622300988517',
        amount: 1,
        type: 'UN',
      },
    },
    {
      value: '2.99',
      product: {
        name: 'CHOC LACTA BIS 45G CHOC',
        code: '7622210566409',
        amount: 1,
        type: 'UN',
      },
    },
    {
      value: '9.9',
      product: {
        name: 'SALG MILHO DORITOS 140G',
        code: '7892840814540',
        amount: 1,
        type: 'UN',
      },
    },
    {
      value: '8.99',
      product: {
        name: 'SALG CHEETOS 140G REQ',
        code: '7892840816261',
        amount: 1,
        type: 'UN',
      },
    },
    {
      value: '8.99',
      product: {
        name: 'SALG FANDANGOS 140G QJO',
        code: '7892840816339',
        amount: 1,
        type: 'UN',
      },
    },
  ],
  store: {
    name: 'SDB COMERCIO DE ALIMENTOS LTDA',
    address: 'Rua R Ceara, 1553, , Jardim dos Estados, CAMPO GRANDE, MS',
  },
};

describe('InvoiceData', () => {
  it('should be defined', () => {
    expect(saleDetails).toBeDefined();
  });

  it('should be equal', () => {
    const data = SaleDetails.fromJSON(saleDetails);

    expect(data).toBeDefined();
    expect(data.store.name).toEqual(saleDetails.store.name);
    expect(data.date).toEqual(saleDetails.date);
    expect(data.products.length).toEqual(saleDetails.priceHistory.length);
    // data.products.forEach((product, index) => {
    //   expect(product).toEqual(invoiceData.products[index]);
    // });
  });
});
