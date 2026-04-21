import { Injectable, Inject, Logger } from '@nestjs/common';

import { TWITCH_PRIME_CONFIG, type TwitchPrimeConfig } from './twitch-prime.config';
import { TwitchPrimeDbService } from './twitch-prime-db.service';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

interface TwitchUsersResponse {
  data: Array<{ id: string; login: string }>;
}

@Injectable()
export class TwitchPrimeAuthService {
  private readonly logger = new Logger(TwitchPrimeAuthService.name);

  constructor(
    @Inject(TWITCH_PRIME_CONFIG) private readonly config: TwitchPrimeConfig,
    private readonly db: TwitchPrimeDbService,
  ) {}

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.TWITCH_CLIENT_ID,
      redirect_uri: this.config.TWITCH_PRIME_REDIRECT_URI,
      response_type: 'code',
      scope: 'user:read:subscriptions',
    });
    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<void> {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.TWITCH_CLIENT_ID,
        client_secret: this.config.TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.TWITCH_PRIME_REDIRECT_URI,
      }).toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as TokenResponse;
    await this.db.set('access_token', data.access_token);
    await this.db.set('refresh_token', data.refresh_token);
    // Invalidate cached user_id on re-auth
    await this.db.set('user_id', '');
    this.logger.log('OAuth tokens stored');
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = await this.db.get('refresh_token');
    if (!refreshToken) throw new Error('No refresh token - visit /twitch-prime/auth');

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.TWITCH_CLIENT_ID,
        client_secret: this.config.TWITCH_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as TokenResponse;
    await this.db.set('access_token', data.access_token);
    await this.db.set('refresh_token', data.refresh_token);
    this.logger.debug('Access token refreshed');
    return data.access_token;
  }

  async getAccessToken(): Promise<string> {
    const token = await this.db.get('access_token');
    if (!token) throw new Error('Not authenticated - visit /twitch-prime/auth');
    return token;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.db.get('access_token');
    return !!token;
  }

  async getUserId(): Promise<string> {
    const cached = await this.db.get('user_id');
    if (cached) return cached;

    const token = await this.getAccessToken();
    const response = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': this.config.TWITCH_CLIENT_ID,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch user: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as TwitchUsersResponse;
    const userId = data.data[0]?.id;
    if (!userId) throw new Error('Empty user response from Twitch');

    await this.db.set('user_id', userId);
    return userId;
  }
}
