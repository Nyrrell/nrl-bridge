import { Module, Logger } from '@nestjs/common';

import { NotifiersModule } from '../../../notifiers/notifiers.module';
import { ItadConfigSchema, ITAD_CONFIG } from './itad.config';
import { CoreModule } from '../../../core/core.module';
import { ItadDbService } from './itad-db.service';
import { ItadScheduler } from './itad.scheduler';
import { ItadService } from './itad.service';
import { ItadSource } from './itad.source';

@Module({
  imports: [CoreModule, NotifiersModule],
  providers: [
    {
      provide: ITAD_CONFIG,
      useFactory: () => {
        const result = ItadConfigSchema.safeParse(process.env);
        if (!result.success) {
          const logger = new Logger('ItadModule');
          logger.error('Invalid configuration', JSON.stringify(result.error.format()));
          throw new Error('ItadModule: invalid configuration, check ITAD_API_KEY');
        }
        return result.data;
      },
    },
    ItadSource,
    ItadDbService,
    ItadService,
    ItadScheduler,
  ],
})
export class ItadModule {}
