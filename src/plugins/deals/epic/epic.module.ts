import { Module } from '@nestjs/common';

import { NotifiersModule } from '../../../notifiers/notifiers.module';
import { CoreModule } from '../../../core/core.module';
import { EpicDbService } from './epic-db.service';
import { EpicScheduler } from './epic.scheduler';
import { EpicService } from './epic.service';
import { EpicSource } from './epic.source';

@Module({
  imports: [CoreModule, NotifiersModule],
  providers: [EpicSource, EpicDbService, EpicService, EpicScheduler],
})
export class EpicModule {}
