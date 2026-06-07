import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { twitchPrimeSample } from '../../plugins/twitch-prime/twitch-prime.sample';
import { dealSample } from '../../plugins/deals/deal.sample';
import { TEST_SAMPLES_TOKEN } from './test-sample.token';
import { NotifiersModule } from '../notifiers.module';
import { CoreModule } from '../../core/core.module';
import { TestController } from './test.controller';

@Module({})
export class TestModule {
  static register(): DynamicModule {
    const logger = new Logger('TestModule');

    if (!process.env['ADMIN_SECRET']) {
      logger.warn('Test endpoint disabled - missing configuration (ADMIN_SECRET)');
      return { module: TestModule };
    }

    return {
      module: TestModule,
      imports: [CoreModule, NotifiersModule],
      controllers: [TestController],
      providers: [
        { provide: TEST_SAMPLES_TOKEN, useValue: [dealSample, twitchPrimeSample] },
      ],
    };
  }
}