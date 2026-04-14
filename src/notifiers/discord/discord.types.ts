export interface DiscordEmbed {
  title: string;
  description: string;
  url: string;
  color: number;
  thumbnail?: { url: string };
  footer?: { text: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}
