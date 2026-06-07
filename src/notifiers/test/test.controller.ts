import {
  HttpException,
  HttpStatus,
  Controller,
  UseGuards,
  HttpCode,
  Inject,
  Logger,
  Param,
  Post,
} from '@nestjs/common';

import { TEST_SAMPLES_TOKEN, type TestSample } from './test-sample.token';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import { NOTIFIERS_TOKEN } from '../../core/notifiers.token';
import { AdminGuard } from '../../core/admin.guard';

@Controller('test')
@UseGuards(AdminGuard)
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    @Inject(NOTIFIERS_TOKEN) private readonly notifiers: Notifier[],
    @Inject(TEST_SAMPLES_TOKEN) private readonly samples: TestSample[],
  ) {}

  @Post(':source')
  @HttpCode(HttpStatus.OK)
  async test(
    @Param('source') source: string,
  ): Promise<{ source: string; notifiers: number; items: number }> {
    const sample = this.samples.find((s) => s.source === source);
    if (!sample) {
      throw new HttpException(
        `No test sample for source '${source}'`,
        HttpStatus.NOT_FOUND,
      );
    }

    const targets = this.notifiers.filter((n) => n.canHandle(source));
    for (const notifier of targets) {
      await notifier.send(sample.items);
    }

    this.logger.log(`Test '${source}' sent to ${targets.length} notifier(s)`);
    return { source, notifiers: targets.length, items: sample.items.length };
  }
}