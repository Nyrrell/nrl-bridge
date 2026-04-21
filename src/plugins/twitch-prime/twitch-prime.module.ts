import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { TwitchPrimeConfigSchema, TWITCH_PRIME_CONFIG } from './twitch-prime.config';
import { TwitchPrimeAuthService } from './twitch-prime-auth.service';
import { NotifiersModule } from '../../notifiers/notifiers.module';
import { TwitchPrimeController } from './twitch-prime.controller';
import { TwitchPrimeDbService } from './twitch-prime-db.service';
import { TwitchPrimeScheduler } from './twitch-prime.scheduler';
import { TwitchPrimeService } from './twitch-prime.service';
import { TwitchPrimeSource } from './twitch-prime.source';
import { isPluginDisabled } from '../../core/config';
import { CoreModule } from '../../core/core.module';

@Module({})
export class TwitchPrimeModule {
  static register(): DynamicModule {
    const logger = new Logger('TwitchPrimeModule');

    if (isPluginDisabled('twitch-prime')) {
      logger.warn('Plugin disabled via DISABLED_PLUGINS');
      return { module: TwitchPrimeModule };
    }

    const result = TwitchPrimeConfigSchema.safeParse(process.env);
    if (!result.success) {
      logger.warn(
        'Plugin disabled - missing configuration (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_PRIME_REDIRECT_URI, TWITCH_PRIME_WEBHOOK_SECRET, DISCORD_TWITCH_PRIME_WEBHOOK_URL)',
      );
      return { module: TwitchPrimeModule };
    }

    return {
      module: TwitchPrimeModule,
      imports: [CoreModule, NotifiersModule],
      controllers: [TwitchPrimeController],
      providers: [
        { provide: TWITCH_PRIME_CONFIG, useValue: result.data },
        TwitchPrimeDbService,
        TwitchPrimeAuthService,
        TwitchPrimeSource,
        TwitchPrimeService,
        TwitchPrimeScheduler,
      ],
      exports: [TwitchPrimeScheduler],
    };
  }
}
