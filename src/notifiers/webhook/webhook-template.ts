import { readFileSync } from 'node:fs';

import type { JsonValue, TemplateVars } from './webhook.types';

const PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/g;
const EXACT_PLACEHOLDER = /^\{\{\s*(\w+)\s*\}\}$/;

// Marks a value to drop from its parent object or array.
const DROP = Symbol('drop');

export function placeholdersIn(text: string): string[] {
  return [...text.matchAll(PLACEHOLDER)].map((m) => m[1]);
}

function collectPlaceholders(value: JsonValue, into: Set<string>): void {
  if (typeof value === 'string') {
    placeholdersIn(value).forEach((name) => into.add(name));
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectPlaceholders(v, into));
  } else if (value !== null && typeof value === 'object') {
    Object.values(value).forEach((v) => collectPlaceholders(v, into));
  }
}

// Throws when a template references a variable that does not exist.
export function assertKnownPlaceholders(body: JsonValue, allowed: readonly string[]): void {
  const used = new Set<string>();
  collectPlaceholders(body, used);
  const unknown = [...used].filter((name) => !allowed.includes(name));
  if (unknown.length > 0) {
    throw new Error(
      `unknown variable(s) ${unknown.map((n) => `{{${n}}}`).join(', ')}; available: ${allowed.join(', ')}`,
    );
  }
}

export function loadTemplateFile(path: string, allowed: readonly string[]): JsonValue {
  let body: JsonValue;
  try {
    body = JSON.parse(readFileSync(path, 'utf8')) as JsonValue;
  } catch (error) {
    throw new Error(`cannot read template "${path}": ${(error as Error).message}`);
  }
  assertKnownPlaceholders(body, allowed);
  return body;
}

export function substitute(text: string, vars: TemplateVars): string {
  return text.replace(PLACEHOLDER, (_, name: string) => String(vars[name] ?? ''));
}

function render(value: JsonValue, vars: TemplateVars): JsonValue | typeof DROP {
  if (typeof value === 'string') {
    const exact = EXACT_PLACEHOLDER.exec(value);
    if (exact) {
      // A lone placeholder keeps the variable's type, and drops the key when empty.
      const v = vars[exact[1]];
      return v === undefined || v === '' ? DROP : v;
    }
    return substitute(value, vars);
  }
  if (Array.isArray(value)) {
    const items = value.map((v) => render(v, vars)).filter((v) => v !== DROP);
    return items.length === 0 && value.length > 0 ? DROP : items;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, render(v, vars)] as const)
      .filter(([, v]) => v !== DROP);
    if (entries.length === 0 && Object.keys(value).length > 0) return DROP;
    return Object.fromEntries(entries) as JsonValue;
  }
  return value;
}

// Fills a JSON template. Substitution works on parsed values, so a variable
// can never break the JSON. Keys left empty are removed, and so are objects
// and arrays emptied by that removal.
export function renderTemplate(template: JsonValue, vars: TemplateVars): JsonValue {
  const result = render(template, vars);
  return result === DROP ? {} : result;
}
