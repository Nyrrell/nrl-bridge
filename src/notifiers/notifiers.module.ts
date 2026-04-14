import { Module } from '@nestjs/common';

import { DiscordDealsNotifier } from './discord/discord-deals.notifier';
import type { Notifier } from '../core/interfaces/notifier.interface';
import { NOTIFIERS_TOKEN } from '../core/notifiers.token';
import { DiscordModule } from './discord/discord.module';

@Module({
  imports: [DiscordModule],
  providers: [
    {
      provide: NOTIFIERS_TOKEN,
      useFactory: (discord: DiscordDealsNotifier): Notifier[] => [discord],
      inject: [DiscordDealsNotifier],
    },
  ],
  exports: [NOTIFIERS_TOKEN],
})
export class NotifiersModule {}
