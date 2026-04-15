import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { NotifiersModule } from '../../../notifiers/notifiers.module';
import { ItadConfigSchema, ITAD_CONFIG } from './itad.config';
import { isPluginDisabled } from '../../../core/config';
import { CoreModule } from '../../../core/core.module';
import { ItadDbService } from './itad-db.service';
import { ItadScheduler } from './itad.scheduler';
import { ItadService } from './itad.service';
import { ItadSource } from './itad.source';

@Module({})
export class ItadModule {
  static register(): DynamicModule {
    const logger = new Logger('ItadModule');

    if (isPluginDisabled('itad')) {
      logger.warn('Plugin disabled via DISABLED_PLUGINS');
      return { module: ItadModule };
    }

    const result = ItadConfigSchema.safeParse(process.env);
    if (!result.success) {
      logger.warn('Plugin disabled — missing configuration (ITAD_API_KEY)');
      return { module: ItadModule };
    }

    return {
      module: ItadModule,
      imports: [CoreModule, NotifiersModule],
      providers: [
        { provide: ITAD_CONFIG, useValue: result.data },
        ItadSource,
        ItadDbService,
        ItadService,
        ItadScheduler,
      ],
    };
  }
}
