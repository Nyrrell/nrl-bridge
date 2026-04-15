import { Module } from '@nestjs/common';

import { DiscordDealsNotifier } from './discord/discord-deals.notifier';
import type { Notifier } from '../core/interfaces/notifier.interface';
import { NOTIFIERS_TOKEN } from '../core/notifiers.token';
import { DiscordModule } from './discord/discord.module';

@Module({
  imports: [DiscordModule.register()],
  providers: [
    {
      provide: NOTIFIERS_TOKEN,
      useFactory: (...notifiers: Notifier[]): Notifier[] => notifiers.filter(Boolean),
      inject: [{ token: DiscordDealsNotifier, optional: true }],
    },
  ],
  exports: [NOTIFIERS_TOKEN],
})
export class NotifiersModule {}
