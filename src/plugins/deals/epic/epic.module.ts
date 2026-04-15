import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { NotifiersModule } from '../../../notifiers/notifiers.module';
import { isPluginDisabled } from '../../../core/config';
import { CoreModule } from '../../../core/core.module';
import { EpicDbService } from './epic-db.service';
import { EpicScheduler } from './epic.scheduler';
import { EpicService } from './epic.service';
import { EpicSource } from './epic.source';

@Module({})
export class EpicModule {
  static register(): DynamicModule {
    if (isPluginDisabled('epic')) {
      new Logger('EpicModule').warn('Plugin disabled via DISABLED_PLUGINS');
      return { module: EpicModule };
    }

    return {
      module: EpicModule,
      imports: [CoreModule, NotifiersModule],
      providers: [EpicSource, EpicDbService, EpicService, EpicScheduler],
      exports: [EpicScheduler],
    };
  }
}