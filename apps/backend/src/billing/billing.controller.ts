import { Controller, Get, Param } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices/:shipperId')
  async getInvoices(@Param('shipperId') shipperId: string) {
    return this.billingService.getInvoicesForShipper(shipperId);
  }
}
