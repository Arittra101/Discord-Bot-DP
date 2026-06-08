# Discord Meeting Reminder Bot

A NestJS-powered REST API that sends scheduled meeting reminders to a Discord channel. Users register and authenticate via JWT, create reminders through the API, and the bot posts an `@everyone` notification to Discord at the exact scheduled time — even across server restarts, thanks to Redis-backed job persistence.

---

## What it does

- **Scheduled Discord alerts** — post a message to a Discord channel at any future date/time
- **Two reminder systems**:
  - **Static cron reminders** — hardcoded recurring messages defined in `src/remiders.config.ts` (e.g. daily stand-up pings)
  - **Dynamic meeting reminders** — user-created one-off reminders via REST API, queued with BullMQ and persisted in Redis (Upstash)
- **JWT authentication** — register, login, and manage reminders securely
- **Role-based access** — `admin` role can create users; `user` role manages their own reminders
- **Swagger UI** — interactive API docs at `http://localhost:3000/api`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| ORM | TypeORM (migrations, no synchronize) |
| Job Queue | BullMQ + Redis via [Upstash](https://upstash.com) |
| Discord | discord.js |
| Auth | JWT (passport-jwt) |
| Cron | @nestjs/schedule |
| API Docs | @nestjs/swagger |
| Deployment | [Railway](https://railway.app) |

---

## Features

- `POST /reminders` — schedule a reminder with a title, content, and UTC datetime
- `GET /reminders?view=upcoming|past|current` — list your reminders filtered by status
- `PATCH /reminders/:id` — update a reminder (only if not yet sent)
- `DELETE /reminders/:id` — cancel a reminder (only if not yet sent)
- Reminders survive server restarts (jobs are persisted in Upstash Redis)
- `@everyone` ping sent to the configured Discord channel when a reminder fires

---

## Prerequisites

- Node.js 18+
- A Discord bot token and a target channel ID
- A PostgreSQL database (e.g. Neon free tier)
- A Redis instance (e.g. Upstash free tier, `rediss://` TLS URL)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
cp src/.env.example src/.env
# Fill in all variables (see below)

# 3. Run database migrations
npm run migration:run

# 4. Start in development (watch mode)
npm run start:dev
```

Swagger UI will be available at `http://localhost:3000/api`.

---

## Environment Variables

Create `src/.env` with the following:

```env
DISCORD_BOT_TOKEN=     # Bot token from Discord Developer Portal
DISCORD_CHANNEL_ID=    # ID of the channel to post reminders in
DATABASE_URL=          # Postgres connection string (e.g. Neon)
JWT_SECRET=            # Secret key for signing JWTs
JWT_EXPIRES_IN=8h      # Optional, defaults to 8h
REDIS_URL=             # Upstash Redis URL (rediss://...)
```

> `src/.env` is gitignored and never committed. In production (Railway), inject these as environment variables directly in the dashboard.

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create a new account |
| POST | `/auth/login` | — | Login, returns JWT |
| PATCH | `/auth/change-password` | JWT | Change your password |
| POST | `/auth/logout` | JWT | Logout |
| POST | `/users` | JWT + admin | Create a user (admin only) |
| GET | `/users` | JWT | List all users |
| GET | `/users/me` | JWT | Your profile |
| POST | `/reminders` | JWT | Create a meeting reminder |
| GET | `/reminders` | JWT | List reminders (`?view=upcoming\|past\|current`) |
| GET | `/reminders/:id` | JWT | Get a single reminder |
| PATCH | `/reminders/:id` | JWT | Update a reminder |
| DELETE | `/reminders/:id` | JWT | Delete a reminder |

All datetime fields (`remindAt`) must be in **UTC ISO 8601** format, e.g. `"2026-06-08T19:05:00Z"`.

---

## Available Scripts

```bash
npm run start:dev        # Run in watch mode (development)
npm run build            # Compile TypeScript
npm run start:prod       # Run compiled output from dist/
npm run test             # Unit tests
npm run test:e2e         # End-to-end tests
npm run lint             # ESLint with auto-fix
npm run format           # Prettier format

npm run migration:run    # Apply pending migrations
npm run migration:revert # Revert last migration
npm run migration:show   # List migration status
```

---

## Deployment (Railway)

1. Push this repo to GitHub
2. Create a new project on [Railway](https://railway.app) and connect the repo
3. Add all environment variables in the Railway dashboard
4. Railway automatically runs `npm run build` then `npm run start:prod`

External services (Neon Postgres + Upstash Redis) remain the same in production.

---

## How a Reminder Is Delivered

```
User calls POST /reminders
        │
        ▼
ReminderProducer enqueues a BullMQ delayed job
(delay = remindAt - now, persisted in Upstash Redis)
        │
        ▼  (at scheduled time)
ReminderWorker processes the job
        │
        ▼
DiscordService.sendMessage() posts @everyone to channel
        │
        ▼
Reminder marked isSent: true in database
```

---

## Author

Built by [Arittra101](https://github.com/Arittra101)
