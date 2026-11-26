export type WebhookPriority = 'silent' | 'normal' | 'urgent';

export type WebhookTone = 'success' | 'info' | 'warning' | 'error';

export interface WebhookEmbed {
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  thumbnail?: { url: string };
  footer?: { text: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

export interface WebhookMessage {
  title: string;
  content?: string;
  priority: WebhookPriority;
  tone?: WebhookTone;
  sender?: string;
  click_url?: string;
  dedupe_key?: string;
  embeds?: WebhookEmbed[];
}
