import { Module } from '@nestjs/common';

import { DiscordTwitchPrimeNotifier } from './discord/discord-twitch-prime.notifier';
import { GotifyTwitchPrimeNotifier } from './gotify/gotify-twitch-prime.notifier';
import { DiscordDealsNotifier } from './discord/discord-deals.notifier';
import { GotifyDealsNotifier } from './gotify/gotify-deals.notifier';
import type { Notifier } from '../core/interfaces/notifier.interface';
import { NOTIFIERS_TOKEN } from '../core/notifiers.token';
import { DiscordModule } from './discord/discord.module';
import { GotifyModule } from './gotify/gotify.module';

@Module({
  imports: [DiscordModule.register(), GotifyModule.register()],
  providers: [
    {
      provide: NOTIFIERS_TOKEN,
      useFactory: (...notifiers: Notifier[]): Notifier[] => notifiers.filter(Boolean),
      inject: [
        { token: DiscordDealsNotifier, optional: true },
        { token: DiscordTwitchPrimeNotifier, optional: true },
        { token: GotifyDealsNotifier, optional: true },
        { token: GotifyTwitchPrimeNotifier, optional: true },
      ],
    },
  ],
  exports: [NOTIFIERS_TOKEN],
})
export class NotifiersModule {}
