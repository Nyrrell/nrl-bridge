import {
  Controller,
  Get,
  Patch,
  Query,
  Body,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Redirect,
  Inject,
} from '@nestjs/common';

import { TWITCH_PRIME_CONFIG, type TwitchPrimeConfig } from './twitch-prime.config';
import { TwitchPrimeAuthService } from './twitch-prime-auth.service';
import { TwitchPrimeDbService } from './twitch-prime-db.service';
import { twitchPrimePage } from './twitch-prime.page';

@Controller('twitch-prime')
export class TwitchPrimeController {
  constructor(
    @Inject(TWITCH_PRIME_CONFIG) private readonly config: TwitchPrimeConfig,
    private readonly auth: TwitchPrimeAuthService,
    private readonly db: TwitchPrimeDbService,
  ) {}

  @Get('auth')
  @Redirect()
  startAuth(): { url: string } {
    return { url: this.auth.getAuthUrl() };
  }

  @Get('callback')
  async oauthCallback(@Query('code') code: string): Promise<{ status: string }> {
    if (!code) {
      throw new HttpException('Missing code parameter', HttpStatus.BAD_REQUEST);
    }
    await this.auth.exchangeCode(code);
    return { status: 'authenticated' };
  }

  @Patch('channel')
  @HttpCode(200)
  async setChannel(@Body() body: { channel?: string }): Promise<{ channel: string }> {
    if (!body.channel || typeof body.channel === 'undefined' || body.channel.trim() === '') {
      throw new HttpException('channel is required', HttpStatus.BAD_REQUEST);
    }

    const channel = body.channel.trim().toLowerCase();
    await this.db.set('watched_channel', channel);
    return { channel };
  }

  @Get('status')
  async status(): Promise<{ authenticated: boolean; channel: string | null }> {
    const authenticated = await this.auth.isAuthenticated();
    const channel =
      (await this.db.get('watched_channel')) ?? this.config.TWITCH_PRIME_CHANNEL ?? null;
    return { authenticated, channel };
  }

  @Get()
  @Header('Content-Type', 'text/html')
  async page(): Promise<string> {
    const channel =
      (await this.db.get('watched_channel')) ?? this.config.TWITCH_PRIME_CHANNEL ?? '';
    const authenticated = await this.auth.isAuthenticated();
    return twitchPrimePage({ authenticated, channel });
  }
}
