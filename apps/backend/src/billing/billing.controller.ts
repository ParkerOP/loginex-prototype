import { Controller, Get, Param } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices/:shipperId')
  async getInvoices(@Param('shipperId') shipperId: string) {
    return this.billingService.getInvoicesForShipper(shipperId);
  }

  @Get('earnings/:driverId')
  async getEarnings(@Param('driverId') driverId: string) {
    return this.billingService.getEarningsForDriver(driverId);
  }
}
