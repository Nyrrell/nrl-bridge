import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrimeService } from './prime.service';

@Injectable()
export class PrimeScheduler {
  private readonly logger = new Logger(PrimeScheduler.name);

  constructor(private readonly primeService: PrimeService) {}

  @Cron('0 8 * * SAT')
  async handleCron(): Promise<void> {
    this.logger.debug('PrimeScheduler cron triggered');
    try {
      await this.primeService.processDeals();
    } catch (err) {
      this.logger.error('Prime cron failed', err);
    }
  }
}
