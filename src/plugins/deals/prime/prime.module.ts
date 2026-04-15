import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { NotifiersModule } from '../../../notifiers/notifiers.module';
import { isPluginDisabled } from '../../../core/config';
import { CoreModule } from '../../../core/core.module';
import { PrimeDbService } from './prime-db.service';
import { PrimeScheduler } from './prime.scheduler';
import { PrimeService } from './prime.service';
import { PrimeSource } from './prime.source';

@Module({})
export class PrimeModule {
  static register(): DynamicModule {
    if (isPluginDisabled('prime')) {
      new Logger('PrimeModule').warn('Plugin disabled via DISABLED_PLUGINS');
      return { module: PrimeModule };
    }

    return {
      module: PrimeModule,
      imports: [CoreModule, NotifiersModule],
      providers: [PrimeSource, PrimeDbService, PrimeService, PrimeScheduler],
      exports: [PrimeScheduler],
    };
  }
}
