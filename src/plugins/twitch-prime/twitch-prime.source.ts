import { Injectable, Inject, Logger } from '@nestjs/common';

import { TWITCH_PRIME_CONFIG, type TwitchPrimeConfig } from './twitch-prime.config';
import type { Source } from '../../core/interfaces/source.interface';
import { TwitchPrimeAuthService } from './twitch-prime-auth.service';
import { TwitchPrimeDbService } from './twitch-prime-db.service';
import type { TwitchPrimeItem } from './twitch-prime.types';

interface TwitchUsersResponse {
  data: Array<{ id: string; login: string }>;
}

interface TwitchSubCheckResponse {
  data: Array<{ broadcaster_id: string; tier: string }>;
}

@Injectable()
export class TwitchPrimeSource implements Source<TwitchPrimeItem> {
  private readonly logger = new Logger(TwitchPrimeSource.name);

  constructor(
    @Inject(TWITCH_PRIME_CONFIG) private readonly config: TwitchPrimeConfig,
    private readonly auth: TwitchPrimeAuthService,
    private readonly db: TwitchPrimeDbService,
  ) {}

  async fetch(): Promise<TwitchPrimeItem[]> {
    const channel = (await this.db.get('watched_channel')) ?? this.config.TWITCH_PRIME_CHANNEL;
    if (!channel) {
      this.logger.debug('No watched channel configured, skipping');
      return [];
    }

    if (!(await this.auth.isAuthenticated())) {
      this.logger.warn('Not authenticated - visit /twitch-prime/auth');
      return [];
    }

    const broadcasterId = await this.resolveBroadcasterId(channel);
    const userId = await this.auth.getUserId();
    const subscribed = await this.checkSubscription(broadcasterId, userId);

    if (subscribed) {
      this.logger.debug(`Still subscribed to ${channel}, Prime sub in use`);
      return [];
    }

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.logger.debug(`Not subscribed to ${channel} - Prime sub available for ${period}`);

    return [
      {
        id: `twitch-prime:available:${period}`,
        source: 'twitch-prime',
        channel,
      },
    ];
  }

  private async resolveBroadcasterId(channelLogin: string): Promise<string> {
    const cached = await this.db.get(`broadcaster_id:${channelLogin}`);
    if (cached) return cached;

    const token = await this.auth.getAccessToken();
    const url = `https://api.twitch.tv/helix/users?login=${encodeURIComponent(channelLogin)}`;
    const response = await this.twitchGet(url, token);

    const data = (await response.json()) as TwitchUsersResponse;
    const broadcasterId = data.data[0]?.id;
    if (!broadcasterId) throw new Error(`Channel not found: ${channelLogin}`);

    await this.db.set(`broadcaster_id:${channelLogin}`, broadcasterId);
    return broadcasterId;
  }

  private async checkSubscription(broadcasterId: string, userId: string): Promise<boolean> {
    const token = await this.auth.getAccessToken();
    const url = `https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${broadcasterId}&user_id=${userId}`;

    let response = await this.twitchGet(url, token);

    if (response.status === 401) {
      const freshToken = await this.auth.refreshAccessToken();
      response = await this.twitchGet(url, freshToken);
    }

    if (response.status === 404) return false;

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Subscription check failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as TwitchSubCheckResponse;
    return data.data.length > 0;
  }

  private twitchGet(url: string, token: string): Promise<Response> {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': this.config.TWITCH_CLIENT_ID,
      },
    });
  }
}
