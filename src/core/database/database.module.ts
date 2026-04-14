import { Module } from '@nestjs/common';

import { SeenItemsService } from './seen-items.service';
import { DatabaseService } from './database.service';
import { loadAppConfig } from '../config';

@Module({
  providers: [
    {
      provide: DatabaseService,
      useFactory: () => new DatabaseService(loadAppConfig().DB_PATH),
    },
    SeenItemsService,
  ],
  exports: [DatabaseService, SeenItemsService],
})
export class DatabaseModule {}
