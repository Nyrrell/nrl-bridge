import type { Logger, DynamicModule, Provider, Type } from '@nestjs/common';
import type { ZodType } from 'zod';

import type { Notifier } from '../core/interfaces/notifier.interface';
import { resolveNotifierConfig } from './notifier-config';
import { CoreModule } from '../core/core.module';

interface NotifierSpec {
  schema: ZodType;
  triggers: string[];
  label: string;
  configToken: symbol;
  notifier: Type<Notifier>;
}

interface NotifierModuleSpec {
  module: Type;
  logger: Logger;
  aggregateToken: symbol;
  notifiers: NotifierSpec[];
}

//Builds a backend notifier module.
export function buildNotifierModule(spec: NotifierModuleSpec): DynamicModule {
  const providers: Provider[] = [];

  for (const entry of spec.notifiers) {
    const config = resolveNotifierConfig(
      entry.schema,
      entry.triggers,
      entry.label,
      spec.logger,
    );
    if (config) {
      providers.push({ provide: entry.configToken, useValue: config }, entry.notifier);
    }
  }

  providers.push({
    provide: spec.aggregateToken,
    useFactory: (...active: (Notifier | undefined)[]): Notifier[] =>
      active.filter((n): n is Notifier => Boolean(n)),
    inject: spec.notifiers.map((entry) => ({ token: entry.notifier, optional: true })),
  });

  return {
    module: spec.module,
    imports: [CoreModule],
    providers,
    exports: [spec.aggregateToken],
  };
}