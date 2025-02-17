/* istanbul ignore file */

import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { InvoiceData } from './dto/invoice-data.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly httpService: HttpService) {}

  async fetchData(url: string): Promise<InvoiceData> {
    console.log('Fetching invoice data from server:', process.env.INVOICE_URL);
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(process.env.INVOICE_URL, {
          url: url,
        }),
      );
      return InvoiceData.fromJSON(data.result);
    } catch (error) {
      console.log(error.response?.status);
      if (error.response) {
        const message =
          error.response.data?.result || 'Failed to load invoice data';
        // The API responded with a status code (e.g., 400)
        console.error('Error status:', error.response.status);
        console.error('Error body:', error.response.data?.result);
        throw new HttpException(message, 500);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something else happened while setting up the request
        console.error('Unexpected error:', error.message);
      }
      throw new HttpException('Failed to load invoice data', 500);
    }
  }
}
