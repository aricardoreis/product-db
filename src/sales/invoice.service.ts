import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { InvoiceData } from './dto/invoice-data.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly httpService: HttpService) {}

  async fetchData(url: string): Promise<InvoiceData> {
    const { data } = await firstValueFrom(
      this.httpService.post(process.env.PRODUCT_DB_URL, {
        url: url,
      }),
    );
    return InvoiceData.fromJSON(data.result);
  }
}
