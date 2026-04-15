import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { DiscordDealsConfigSchema, DISCORD_DEALS_CONFIG } from './discord.config';
import { DiscordDealsNotifier } from './discord-deals.notifier';

@Module({})
export class DiscordModule {
  static register(): DynamicModule {
    const result = DiscordDealsConfigSchema.safeParse(process.env);
    if (!result.success) {
      new Logger('DiscordModule').warn(
        'Notifier disabled — missing configuration (DISCORD_DEALS_WEBHOOK_URL)',
      );
      return { module: DiscordModule };
    }

    return {
      module: DiscordModule,
      providers: [{ provide: DISCORD_DEALS_CONFIG, useValue: result.data }, DiscordDealsNotifier],
      exports: [DiscordDealsNotifier],
    };
  }
}
