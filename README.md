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
| `DB_PATH`          | `bridge.db`    | Path to the SQLite database                                   |
| `RUN_ON_STARTUP`   | `false`        | Run all active cron tasks once immediately at startup         |
| `LOCALE`           | `fr-FR`        | Used for date formatting                                      |
| `TIMEZONE`         | `Europe/Paris` | Used for date formatting                                      |
| `COUNTRY`          | `FR`           | Country code for API queries                                  |
| `DISABLED_PLUGINS` | *(empty)*      | Comma-separated list of plugins to disable (e.g. `epic,itad`) |

### Plugin: deals

| Variable                        | Required | Description                                   |
|---------------------------------|----------|-----------------------------------------------|
| `DISCORD_DEALS_WEBHOOK_URL`     | yes      | Discord webhook URL for deal alerts           |
| `ITAD_API_KEY`                  | yes      | IsThereAnyDeal API key                        |
| `DISCORD_DEALS_EPIC_THREAD_ID`  | no       | Post Epic deals to a specific Discord thread  |
| `DISCORD_DEALS_ITAD_THREAD_ID`  | no       | Post ITAD deals to a specific Discord thread  |
| `DISCORD_DEALS_PRIME_THREAD_ID` | no       | Post Prime deals to a specific Discord thread |

### Plugin: twitch-prime

> [!NOTE]  
> This plugin automates the check of your Twitch Prime availability by monitoring your subscription status on a specific channel.  
> Since the Twitch API does not specify if an active subscription is a Prime one, the system deduces availability once the sub on the target channel expires, allowing for automated notifications when it's time to re-sub.

Setup: register `TWITCH_PRIME_REDIRECT_URI` in your [Twitch app](https://dev.twitch.tv/console), then visit `GET /twitch-prime/auth` to authenticate.

| Variable                           | Required | Description                                                             |
|------------------------------------|----------|-------------------------------------------------------------------------|
| `TWITCH_CLIENT_ID`                 | yes      | Twitch application client ID                                            |
| `TWITCH_CLIENT_SECRET`             | yes      | Twitch application client secret                                        |
| `TWITCH_PRIME_REDIRECT_URI`        | yes      | OAuth redirect URI (e.g. `http://localhost:3000/twitch-prime/callback`) |
| `DISCORD_TWITCH_PRIME_WEBHOOK_URL` | yes      | Discord webhook URL for Prime sub reminders                             |
| `TWITCH_PRIME_CHANNEL`             | no       | Default channel to watch (can be set via `GET /twitch-prime`)           |
| `DISCORD_TWITCH_PRIME_THREAD_ID`   | no       | Post reminders to a specific Discord thread                             |