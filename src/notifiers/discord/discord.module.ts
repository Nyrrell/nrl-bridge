import { Module, Logger } from '@nestjs/common';

import { DiscordDealsConfigSchema, DISCORD_DEALS_CONFIG } from './discord.config';
import { DiscordDealsNotifier } from './discord-deals.notifier';

@Module({
  providers: [
    {
      provide: DISCORD_DEALS_CONFIG,
      useFactory: () => {
        const result = DiscordDealsConfigSchema.safeParse(process.env);
        if (!result.success) {
          const logger = new Logger('DiscordModule');
          logger.error('Invalid configuration', JSON.stringify(result.error.format()));
          throw new Error('DiscordModule: invalid configuration, check DISCORD_DEALS_WEBHOOK_URL');
        }
        return result.data;
      },
    },
    DiscordDealsNotifier,
  ],
  exports: [DiscordDealsNotifier],
})
export class DiscordModule {}
