import type { DiscordEmbed } from './discord.types';

export async function postToWebhook(
  webhookUrl: string,
  threadId: string | undefined,
  embeds: DiscordEmbed[],
): Promise<void> {
  const url = threadId ? `${webhookUrl}?thread_id=${threadId}` : webhookUrl;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook failed: ${response.status} - ${text}`);
  }
}
