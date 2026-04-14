import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { isPluginDisabled } from '../../../core/config';
import { EpicService } from './epic.service';

@Injectable()
export class EpicScheduler {
  private readonly logger = new Logger(EpicScheduler.name);

  constructor(private readonly epicService: EpicService) {}

  @Cron('0 */12 * * *', { disabled: isPluginDisabled('epic') })
  async handleCron(): Promise<void> {
    this.logger.debug('EpicController cron triggered');
    try {
      await this.epicService.processDeals();
    } catch (err) {
      this.logger.error('Epic cron failed', err);
    }
  }
}
