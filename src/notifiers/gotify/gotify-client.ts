import type { GotifyMessage } from './gotify.types';

export async function postMessage(
  url: string,
  token: string,
  message: GotifyMessage,
): Promise<void> {
  const base = url.replace(/\/+$/, '');
  const response = await fetch(`${base}/message?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gotify message failed: ${response.status} - ${text}`);
  }
}