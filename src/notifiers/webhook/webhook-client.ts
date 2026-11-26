import type { WebhookMessage } from './webhook.types';

export async function postMessage(
  url: string,
  token: string,
  message: WebhookMessage,
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Webhook message failed: ${response.status} - ${text}`);
  }
}
