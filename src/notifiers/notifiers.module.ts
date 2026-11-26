import { Module } from '@nestjs/common';

import { DiscordModule, DISCORD_NOTIFIERS } from './discord/discord.module';
import { GotifyModule, GOTIFY_NOTIFIERS } from './gotify/gotify.module';
import type { Notifier } from '../core/interfaces/notifier.interface';
import { WebhookModule, WEBHOOK_NOTIFIERS } from './webhook/webhook.module';
import { MailModule, MAIL_NOTIFIERS } from './mail/mail.module';
import { NOTIFIERS_TOKEN } from '../core/notifiers.token';

@Module({
  imports: [
    DiscordModule.register(),
    GotifyModule.register(),
    MailModule.register(),
    WebhookModule.register(),
  ],
  providers: [
    {
      provide: NOTIFIERS_TOKEN,
      useFactory: (...lists: Notifier[][]): Notifier[] => lists.flat(),
      inject: [DISCORD_NOTIFIERS, GOTIFY_NOTIFIERS, MAIL_NOTIFIERS, WEBHOOK_NOTIFIERS],
    },
  ],
  exports: [NOTIFIERS_TOKEN],
})
export class NotifiersModule {}
