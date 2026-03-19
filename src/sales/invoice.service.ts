/* istanbul ignore file */

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { InvoiceData } from './dto/invoice-data.dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchData(url: string): Promise<InvoiceData> {
    this.logger.log(`Fetching invoice data from server: ${process.env.INVOICE_URL}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(process.env.INVOICE_URL, {
          url: url,
        }),
      );
      return InvoiceData.fromJSON(data.result);
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.result || 'Failed to load invoice data';
        this.logger.error(`Invoice service error: status=${error.response.status} body=${JSON.stringify(error.response.data?.result)}`);

        if (error.response.status >= 400 && error.response.status < 500) {
          throw new BadRequestException(message);
        } else {
          throw new ServiceUnavailableException(message);
        }
      } else if (error.request) {
        this.logger.error('Invoice service unavailable: no response received');
        throw new ServiceUnavailableException('Invoice service is currently unavailable');
      } else {
        this.logger.error(`Unexpected error: ${error.message}`);
        throw new ServiceUnavailableException('Failed to connect to invoice service');
      }
    }
  }
}
