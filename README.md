# nrl-bridge

A personal modular notification hub – pulls from sources, receives webhooks, and relays alerts.

## Stack

- Node.js 22, TypeScript, pnpm
- NestJS with Fastify
- SQLite via Kysely + better-sqlite3
- Podman Quadlet (systemd integration)

## Prerequisites

- Node.js 22
- pnpm

## Getting started

```bash
cp .env.example .env    # edit with your values
pnpm install
pnpm run start:dev
```

## Environment variables

See `.env.example` for the full list. Missing plugin or notifier variables will auto-disable the affected module with a warning instead of crashing.

### Core

| Variable           | Default        | Description                                                   |
|--------------------|----------------|---------------------------------------------------------------|
| `LOG_LEVEL`        | `info`         | `debug` / `info` / `warn` / `error`                           |
| `PORT`             | `3000`         | HTTP server port                                              |
| `HOST`             | `0.0.0.0`      | HTTP listen address (`127.0.0.1` behind a local reverse proxy) |
| `DB_PATH`          | `bridge.db`    | Path to the SQLite database                                   |
| `RUN_ON_STARTUP`   | `false`        | Run all active cron tasks once immediately at startup         |
| `LOCALE`           | `fr-FR`        | Used for date formatting                                      |
| `TIMEZONE`         | `Europe/Paris` | Used for date formatting                                      |
| `COUNTRY`          | `FR`           | Country code for API queries                                  |
| `DISABLED_PLUGINS` | *(empty)*      | Comma-separated list of plugins to disable (e.g. `epic,itad`) |
| `ADMIN_SECRET`     | *(empty)*      | Secret for admin endpoints (e.g. `POST /test/:source`). Unset disables them |

### Plugin: deals

| Variable       | Required | Description            |
|----------------|----------|------------------------|
| `ITAD_API_KEY` | yes      | IsThereAnyDeal API key |

### Plugin: twitch-prime

> [!NOTE]  
> This plugin automates the check of your Twitch Prime availability by monitoring your subscription status on a specific channel.  
> Since the Twitch API does not specify if an active subscription is a Prime one, the system deduces availability once the sub on the target channel expires, allowing for automated notifications when it's time to re-sub.

Setup: register `TWITCH_PRIME_REDIRECT_URI` in your [Twitch app](https://dev.twitch.tv/console), then visit `GET /twitch-prime/auth` to authenticate.

| Variable                    | Required | Description                                                             |
|-----------------------------|----------|-------------------------------------------------------------------------|
| `TWITCH_CLIENT_ID`          | yes      | Twitch application client ID                                            |
| `TWITCH_CLIENT_SECRET`      | yes      | Twitch application client secret                                        |
| `TWITCH_PRIME_REDIRECT_URI` | yes      | OAuth redirect URI (e.g. `http://localhost:3000/twitch-prime/callback`) |
| `TWITCH_PRIME_CHANNEL`      | no       | Default channel to watch (can be set via `GET /twitch-prime`)           |

## Notifiers

Alerts are relayed by **Discord**, **Gotify**, **mail** and/or a generic **JSON webhook**, which are independent and equal: use any combination. A notifier activates as soon as you set any of its variables. Once activated it is validated strictly, so a partial config (e.g. a token without its URL) crashes the boot with an explicit message rather than failing silently. Set up **at least one** notifier, otherwise alerts go nowhere.

In each table below, `Required` means required **once that notifier is in use**.

### Notifier: discord

The deals notifier activates with `DISCORD_DEALS_WEBHOOK_URL`; the Twitch Prime notifier with `DISCORD_TWITCH_PRIME_WEBHOOK_URL`. They are independent.

| Variable                           | Required | Description                                |
|------------------------------------|----------|--------------------------------------------|
| `DISCORD_DEALS_WEBHOOK_URL`        | yes      | Webhook URL for deal alerts                |
| `DISCORD_DEALS_EPIC_THREAD_ID`     | no       | Post Epic deals to a specific thread       |
| `DISCORD_DEALS_ITAD_THREAD_ID`     | no       | Post ITAD deals to a specific thread       |
| `DISCORD_DEALS_PRIME_THREAD_ID`    | no       | Post Prime deals to a specific thread      |
| `DISCORD_TWITCH_PRIME_WEBHOOK_URL` | yes      | Webhook URL for Twitch Prime sub reminders |
| `DISCORD_TWITCH_PRIME_THREAD_ID`   | no       | Post reminders to a specific thread        |

### Notifier: gotify

The deals notifier activates with at least one deal token; the Twitch Prime notifier with `GOTIFY_TWITCH_PRIME_TOKEN`. Each source maps to its own [Gotify application token](https://gotify.net/docs/pushmsg), so Epic / ITAD / Prime / Twitch Prime can land in different apps. `GOTIFY_URL` is shared by all of them.

| Variable                       | Required | Description                                                 |
|--------------------------------|----------|-------------------------------------------------------------|
| `GOTIFY_URL`                   | yes      | Base URL of your Gotify server                              |
| `GOTIFY_EPIC_TOKEN`            | no       | App token for Epic deals (one deal token at least)          |
| `GOTIFY_ITAD_TOKEN`            | no       | App token for ITAD deals (one deal token at least)          |
| `GOTIFY_PRIME_TOKEN`           | no       | App token for Amazon Prime deals (one deal token at least)  |
| `GOTIFY_DEALS_PRIORITY`        | no       | Priority `0-10` shared by the three deal tokens (default 5) |
| `GOTIFY_TWITCH_PRIME_TOKEN`    | yes      | App token for Twitch Prime sub reminders                    |
| `GOTIFY_TWITCH_PRIME_PRIORITY` | no       | Priority `0-10` for Twitch Prime reminders (default 5)      |

### Notifier: webhook

A generic JSON notifier: you write the JSON body yourself, as a template, so any receiver that accepts a JSON `POST` works (a self-hosted notifier, a proprietary API, your own script). The deals notifier activates with at least one deal token; the Twitch Prime notifier with `WEBHOOK_TWITCH_PRIME_TOKEN`. Each source has its own token, so the receiver can route Epic / ITAD / Prime / Twitch Prime separately.

| Variable                        | Required | Description                                                                      |
|---------------------------------|----------|----------------------------------------------------------------------------------|
| `WEBHOOK_URL`                   | yes      | Full URL of the endpoint, used as-is. May contain `{{token}}` (URL-encoded)      |
| `WEBHOOK_AUTH_HEADER`           | no       | `Name: value` header, `{{token}}` allowed. Default `Authorization: Bearer {{token}}`, empty to send none |
| `WEBHOOK_EPIC_TOKEN`            | no       | Token for Epic deals (one deal token at least)                                   |
| `WEBHOOK_ITAD_TOKEN`            | no       | Token for ITAD deals (one deal token at least)                                   |
| `WEBHOOK_PRIME_TOKEN`           | no       | Token for Amazon Prime deals (one deal token at least)                           |
| `WEBHOOK_DEALS_TEMPLATE`        | yes      | Path to the JSON template for deals                                              |
| `WEBHOOK_TWITCH_PRIME_TOKEN`    | yes      | Token for Twitch Prime sub reminders                                             |
| `WEBHOOK_TWITCH_PRIME_TEMPLATE` | yes      | Path to the JSON template for Twitch Prime                                       |

There is no built-in body: the receiver's format cannot be guessed, so each active notifier needs its template, and a missing one crashes the boot. Start from the examples in [`examples/webhook/`](examples/webhook/). In the container, only `data/` is mounted: copy your templates there (e.g. `WEBHOOK_DEALS_TEMPLATE=data/webhook/deals.json`).

#### Templates

A template is any JSON document. `{{name}}` placeholders are replaced in every string value; one request is sent per item, with `Content-Type: application/json`.

- Substitution works on the parsed JSON, so a value (quotes, newlines...) can never break it.
- A string that is **only** a placeholder takes the variable's type (`"{{endDateTs}}"` becomes a number) and is **removed** when the value is empty, along with any object or array left empty by that removal. Elsewhere, an empty value becomes an empty string.
- Templates are read and checked at boot: invalid JSON or an unknown variable crashes with an explicit message.
- The token is never available in the body, only in `WEBHOOK_URL` and `WEBHOOK_AUTH_HEADER`.

| Source         | Variables |
|----------------|-----------|
| deals          | `id`, `plugin`, `title`, `description`, `url`, `store`, `originalPrice`, `thumbnailUrl`, `endDate` (formatted with `LOCALE` / `TIMEZONE`, `Inconnu` if unknown), `endDateTs` (Unix seconds, empty if unknown) |
| twitch-prime   | `id`, `channel`, `channelUrl` |

`id` is stable per item: use it as an idempotency key if your receiver supports one.

Examples in [`examples/webhook/`](examples/webhook/), all checked by the test suite:

| File                 | Content |
|----------------------|---------|
| `deals.json`         | Rich message: title, Markdown content, priority, tone, sender, click URL, idempotency key, Discord-style embed with thumbnail, fields and footer |
| `twitch-prime.json`  | Same shape for Twitch Prime reminders |
| `deals.minimal.json` | Flat `title` / `message` body |

Example for a receiver that takes the token in the query string and a flat body:

```bash
WEBHOOK_URL=https://push.example.com/message?token={{token}}
WEBHOOK_AUTH_HEADER=
WEBHOOK_DEALS_TEMPLATE=data/webhook/deals.json
```

```json
{ "title": "{{title}}", "message": "Free until {{endDate}}: {{url}}", "priority": 5 }
```

Any non-2xx response is treated as a failure (the item is not marked as seen and is retried on the next run).

### Notifier: mail

Sends alerts over SMTP (HTML with a plain-text fallback). The SMTP connection is shared; recipients drive activation and routing:

- `MAIL_TO` set: mail is active for **all** sources, with `MAIL_TO` as default recipient.
- `MAIL_<SOURCE>_TO` set: overrides the recipient for that source, or activates it alone if `MAIL_TO` is unset.
- Effective recipient of a source = `MAIL_<SOURCE>_TO` if set, otherwise `MAIL_TO`.

So "everything to me" = set only `MAIL_TO`; "mail only Twitch Prime" = set only `MAIL_TWITCH_PRIME_TO`. Any recipient set makes the SMTP block required.

| Variable               | Required | Description                                                        |
|------------------------|----------|--------------------------------------------------------------------|
| `MAIL_SMTP_HOST`       | yes      | SMTP server host                                                   |
| `MAIL_SMTP_PORT`       | no       | SMTP port (default `587`)                                          |
| `MAIL_SMTP_SECURE`     | no       | `true` for implicit TLS (port 465), `false` for STARTTLS (default) |
| `MAIL_SMTP_USER`       | no       | SMTP username (omit for relays without auth)                       |
| `MAIL_SMTP_PASS`       | no       | SMTP password (omit for relays without auth)                       |
| `MAIL_FROM`            | yes      | From address                                                       |
| `MAIL_TO`              | no       | Global recipient(s), comma-separated. Activates all sources        |
| `MAIL_DEALS_TO`        | no       | Override recipient(s) for deals                                    |
| `MAIL_TWITCH_PRIME_TO` | no       | Override recipient(s) for Twitch Prime reminders                   |

## Testing notifiers

When `ADMIN_SECRET` is set, an admin endpoint lets you fire a sample notification through every active notifier that handles a given source, without waiting for a real event:

```bash
curl -X POST -H "x-admin-secret: $ADMIN_SECRET" http://localhost:3000/test/deals
curl -X POST -H "x-admin-secret: $ADMIN_SECRET" http://localhost:3000/test/twitch-prime
```

`POST /test/:source` routes a sample item to all notifiers whose `canHandle(source)` matches (Discord, Gotify, mail...), so it exercises the real send path and lands in your real channels. The endpoint is protected by `ADMIN_SECRET` via the `x-admin-secret` header; leaving `ADMIN_SECRET` unset removes the route entirely. Unknown sources return `404`, a missing or wrong secret returns `401`.
## Releases

Versions follow [SemVer](https://semver.org/) and are marked with annotated `vX.Y.Z` git tags, kept in sync with `package.json`. To cut a release from a clean working tree:

```sh
pnpm version patch --message "bump version to %s"   # or minor / major
git push --follow-tags
```

`pnpm version` bumps `package.json`, commits it and creates the matching tag.
