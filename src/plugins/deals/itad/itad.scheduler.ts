import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { isPluginDisabled } from '../../../core/config';
import { ItadService } from './itad.service';

@Injectable()
export class ItadScheduler {
  private readonly logger = new Logger(ItadScheduler.name);

  constructor(private readonly itadService: ItadService) {}

  @Cron('0 */6 * * *', { disabled: isPluginDisabled('itad') })
  async handleCron(): Promise<void> {
    this.logger.debug('ItadScheduler cron triggered');
    try {
      await this.itadService.processDeals();
    } catch (err) {
      this.logger.error('ITAD cron failed', err);
    }
  }
}
