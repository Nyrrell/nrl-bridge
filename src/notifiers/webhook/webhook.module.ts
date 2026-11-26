import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { WebhookTwitchPrimeNotifier } from './webhook-twitch-prime.notifier';
import { WebhookDealsNotifier } from './webhook-deals.notifier';
import { buildNotifierModule } from '../notifier-module';
import {
  WebhookDealsConfigSchema,
  WEBHOOK_DEALS_CONFIG,
  WebhookTwitchPrimeConfigSchema,
  WEBHOOK_TWITCH_PRIME_CONFIG,
} from './webhook.config';

export const WEBHOOK_NOTIFIERS = Symbol('WEBHOOK_NOTIFIERS');

@Module({})
export class WebhookModule {
  static register(): DynamicModule {
    return buildNotifierModule({
      module: WebhookModule,
      logger: new Logger('WebhookModule'),
      aggregateToken: WEBHOOK_NOTIFIERS,
      notifiers: [
        {
          schema: WebhookDealsConfigSchema,
          triggers: ['WEBHOOK_EPIC_TOKEN', 'WEBHOOK_ITAD_TOKEN', 'WEBHOOK_PRIME_TOKEN'],
          label: 'Webhook deals',
          configToken: WEBHOOK_DEALS_CONFIG,
          notifier: WebhookDealsNotifier,
        },
        {
          schema: WebhookTwitchPrimeConfigSchema,
          triggers: ['WEBHOOK_TWITCH_PRIME_TOKEN'],
          label: 'Webhook Twitch Prime',
          configToken: WEBHOOK_TWITCH_PRIME_CONFIG,
          notifier: WebhookTwitchPrimeNotifier,
        },
      ],
    });
  }
}
