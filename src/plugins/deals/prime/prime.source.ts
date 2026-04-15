import { Injectable } from '@nestjs/common';

import type { Source } from '../../../core/interfaces/source.interface';
import type { LunaGamesResponse, LunaItem } from './prime.types';
import type { Deal } from '../deal.types';

const LUNA_HOME_URL = 'https://luna.amazon.fr/claims/home';
const LUNA_GRAPHQL_URL = 'https://luna.amazon.fr/graphql';

const COMMON_HEADERS = {
  Accept: 'text/html',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
};

const OFFERS_QUERY = `query OffersContext_Offers_And_Items($pageSize: Int) {
  games: items(collectionType: FREE_GAMES, pageSize: $pageSize) {
    items {
      id
      isFGWP
      assets {
        id
        title
        externalClaimLink
        shortformDescription
        cardMedia {
          defaultMedia {
            src1x
            src2x
            type
          }
        }
      }
      offers {
        id
        startTime
        endTime
      }
    }
  }
}`;

function extractCookies(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
}

function mergeCookies(...cookieStrings: string[]): string {
  const all = cookieStrings.flatMap((s) => s.split('; ').filter(Boolean));
  return [...new Map(all.map((c) => [c.split('=')[0], c])).values()].join('; ');
}

@Injectable()
export class PrimeSource implements Source<Deal> {
  async fetch(): Promise<Deal[]> {
    const { csrfToken, cookies } = await this.fetchSession();

    const response = await fetch(LUNA_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': COMMON_HEADERS['User-Agent'],
        'csrf-token': csrfToken,
        'Client-Id': 'CarboniteApp',
        'prime-gaming-language': 'fr-FR',
        Origin: 'https://luna.amazon.fr',
        Referer: LUNA_HOME_URL,
        Cookie: cookies,
      },
      body: JSON.stringify({
        operationName: 'OffersContext_Offers_And_Items',
        variables: { pageSize: 999 },
        query: OFFERS_QUERY,
      }),
    });

    if (!response.ok) {
      throw new Error(`Luna GraphQL API responded with ${response.status}`);
    }

    const json = (await response.json()) as LunaGamesResponse;
    const items = json?.data?.games?.items ?? [];

    return items.filter((item) => item.isFGWP).map((item) => this.mapToDeal(item));
  }

  private async fetchSession(): Promise<{ csrfToken: string; cookies: string }> {
    const home = await fetch(LUNA_HOME_URL, {
      headers: COMMON_HEADERS,
      redirect: 'manual',
    });
    const homeCookies = extractCookies(home);

    const location = home.headers.get('location');
    const page = location
      ? await fetch(location, { headers: { ...COMMON_HEADERS, Cookie: homeCookies } })
      : home;

    const html = await page.text();
    const match = html.match(/csrf-key' value='([^']+)'/);
    if (!match) {
      throw new Error('Could not extract CSRF token from Luna home page');
    }

    return {
      csrfToken: match[1],
      cookies: mergeCookies(homeCookies, extractCookies(page)),
    };
  }

  private mapToDeal(item: LunaItem): Deal {
    const endDate = item.offers?.[0]?.endTime ?? null;

    return {
      id: `deals:prime:${item.id}`,
      source: 'deals',
      store: 'Prime Gaming',
      title: item.assets.title,
      description: item.assets.shortformDescription,
      thumbnailUrl: item.assets.cardMedia.defaultMedia.src2x,
      url: item.assets.externalClaimLink,
      originalPrice: 'Free',
      endDate,
    };
  }
}
