import type { JsonValue, WebhookTarget } from './webhook.types';
import { substitute } from './webhook-template';

// Resolves {{token}} in the URL and the auth header for one token.
export function buildTarget(
  url: string,
  authHeader: { name: string; value: string } | undefined,
  token: string,
): WebhookTarget {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) {
    headers[authHeader.name] = substitute(authHeader.value, { token });
  }
  return { url: substitute(url, { token: encodeURIComponent(token) }), headers };
}

export async function postJson(target: WebhookTarget, body: JsonValue): Promise<void> {
  const response = await fetch(target.url, {
    method: 'POST',
    headers: target.headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Webhook message failed: ${response.status} - ${text}`);
  }
}
