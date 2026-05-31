export interface GotifyMessage {
  title: string;
  message: string;
  priority: number;
  extras?: Record<string, unknown>;
}