import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { TwitchPrimeService } from './twitch-prime.service';

@Injectable()
export class TwitchPrimeScheduler {
  private readonly logger = new Logger(TwitchPrimeScheduler.name);

  constructor(private readonly service: TwitchPrimeService) {}

  @Cron('0 * * * *')
  async handleCron(): Promise<void> {
    this.logger.debug('TwitchPrimeScheduler cron triggered');
    try {
      await this.service.check();
    } catch (err) {
      this.logger.error('Twitch Prime cron failed', err);
    }
  }
}
