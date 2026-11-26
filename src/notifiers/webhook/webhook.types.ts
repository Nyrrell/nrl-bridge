export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Values a template can reference with {{name}}. Undefined means "no value".
export type TemplateVars = Record<string, string | number | undefined>;

export interface WebhookTarget {
  url: string;
  headers: Record<string, string>;
}
