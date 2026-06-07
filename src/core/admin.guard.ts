import {
  UnauthorizedException,
  ExecutionContext,
  CanActivate,
  Injectable,
  Inject,
} from '@nestjs/common';

import { APP_CONFIG, type AppConfig } from './config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const secret = request.headers['x-admin-secret'];

    if (!this.config.ADMIN_SECRET || secret !== this.config.ADMIN_SECRET) {
      throw new UnauthorizedException('Invalid admin secret');
    }
    return true;
  }
}