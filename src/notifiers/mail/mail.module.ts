import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { MailTwitchPrimeNotifier } from './mail-twitch-prime.notifier';
import { MailDealsNotifier } from './mail-deals.notifier';
import { buildNotifierModule } from '../notifier-module';
import {
  MailDealsConfigSchema,
  MAIL_DEALS_CONFIG,
  MailTwitchPrimeConfigSchema,
  MAIL_TWITCH_PRIME_CONFIG,
} from './mail.config';

export const MAIL_NOTIFIERS = Symbol('MAIL_NOTIFIERS');

@Module({})
export class MailModule {
  static register(): DynamicModule {
    return buildNotifierModule({
      module: MailModule,
      logger: new Logger('MailModule'),
      aggregateToken: MAIL_NOTIFIERS,
      notifiers: [
        {
          schema: MailDealsConfigSchema,
          triggers: ['MAIL_DEALS_TO', 'MAIL_TO'],
          label: 'Mail deals',
          configToken: MAIL_DEALS_CONFIG,
          notifier: MailDealsNotifier,
        },
        {
          schema: MailTwitchPrimeConfigSchema,
          triggers: ['MAIL_TWITCH_PRIME_TO', 'MAIL_TO'],
          label: 'Mail Twitch Prime',
          configToken: MAIL_TWITCH_PRIME_CONFIG,
          notifier: MailTwitchPrimeNotifier,
        },
      ],
    });
  }
}