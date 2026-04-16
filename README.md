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

See `.env.example` for the full list.

| Variable                    | Default     | Description                                                  |
|-----------------------------|-------------|--------------------------------------------------------------|
| `LOG_LEVEL`                 | `info`      | `debug` / `info` / `warn` / `error`                          |
| `PORT`                      | `3000`      | HTTP server port                                             |
| `DB_PATH`                   | `bridge.db` | Path to the SQLite database                                  |
| `DISABLED_PLUGINS`          | *(empty)*   | Comma-separated list of plugins to disable (e.g. `epic,itad`) |
| `RUN_ON_STARTUP`            | `false`     | Run all active cron tasks once immediately at startup        |
| `LOCALE`                    | `fr-FR`     | Used for date formatting                                     |
| `TIMEZONE`                  | `Europe/Paris` | Used for date formatting                                     |
| `COUNTRY`                   | `FR`        | Country code for API queries                    |
| `DISCORD_DEALS_WEBHOOK_URL` | -           | Discord webhook URL for deal alerts                          |
| `ITAD_API_KEY`              | -           | IsThereAnyDeal API key                                       |

Missing plugin or notifier variables will auto-disable the affected module with a warning instead of crashing.