<h1 align="center">GudCal Core — ClearPillar Scheduling</h1>

<p align="center">
  ClearPillar's internal advising/tutoring scheduling system, built on top of the
  open-source <a href="https://github.com/gudlab/gudcal-core">GudCal</a> scaffold.
</p>

---

## Current status (read this first)

This started from GudCal's generic open-source "Calendly alternative" starter template.
The database schema has since been fully replaced with ClearPillar's real domain model
(`Person`, `Student`, `Tutor`, `Advisor`, `Session`, `Schedule`, `Assignment`, `Payment`,
etc.), and GudCal's original generic demo app (bookings, event types, organizations,
API keys, webhooks, and NextAuth-based login) has been removed because it was built
against models that no longer exist.

**What works right now:**
- Public marketing pages, docs
- Local dev server, database connection, migrations
- Google Calendar sync backend (`lib/calendar/google.ts`) — OAuth flow, busy-time
  lookups, event read/write, all keyed to `Person.person_id`

**What's intentionally not working yet:**
- **No login.** NextAuth's session tables (`User`/`Account`/`Session`/`VerificationToken`)
  are gone. The plan is to use **Clerk** instead (`Person.clerk_id` already exists in the
  schema), but `@clerk/nextjs` isn't installed yet — that's the Security team's task. Until
  then, `lib/auth/current-person.ts`'s `getCurrentPersonId()` always returns `null`, so
  anything gated on "who's logged in" (both dashboard pages, calendar connect/disconnect)
  fails closed rather than granting access to the wrong person.
- **No booking pages yet.** The only surviving pages under `/dashboard` are
  `/dashboard/integrations` (Google Calendar connect/disconnect) and `/dashboard/charts`
  (demo chart components, unrelated to real data). Everything else — booking, rescheduling,
  cancelling, marking lateness — is Kent's Phase 1 work, built fresh against the real
  schema, not adapted from GudCal's old generic `Booking`/`EventType` system.
- **No custom meeting-link creation yet.** Video Conferencing team is building this
  directly against the Google Meet REST API rather than GudCal's old
  Calendar-API-conferenceData approach.

See the Calendar Team deliverable doc for the full task breakdown and current phase.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) via [Prisma](https://www.prisma.io/) 7, hosted on [Supabase](https://supabase.com/)
- **Auth:** planned — [Clerk](https://clerk.com/) (not yet installed)
- **Email:** [Resend](https://resend.com/) & [React Email](https://react.email/)
- **UI:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/), [Lucide](https://lucide.dev/)
- **Package manager:** [pnpm](https://pnpm.io/) — this repo has a stray `package-lock.json`
  from someone running plain `npm install` at some point; ignore/delete it, `pnpm-lock.yaml`
  is the real one

## Local Setup

**Prerequisites:** Node 20+ (`.nvmrc` pins 20.18.0; 24.x has also worked fine in practice),
pnpm, access to the team's Supabase project.

1. Clone and install:
   ```bash
   git clone <this repo>
   cd gudcal-core
   pnpm install
   pnpm approve-builds --all   # pnpm blocks native postinstall scripts by default;
                                # this project needs sharp, esbuild, contentlayer2, @prisma/engines
   ```

2. Set up environment variables — copy `.env.example` to **both** `.env` and `.env.local`
   (see the note under Environment Variables below for why both are needed) and fill in the
   values from the team's shared secrets. At minimum you need: `DATABASE_URL`, `DIRECT_URL`,
   `AUTH_SECRET`, `GOOGLE_CLIENT_ID`/`SECRET`, `ENCRYPTION_KEY`, `RESEND_API_KEY` (see gotcha
   below), `NEXT_PUBLIC_APP_URL`.

3. Sync the database:
   ```bash
   npx prisma generate
   npx prisma migrate status   # should print "Database schema is up to date!"
   ```
   If it doesn't, **stop and ask before running `migrate dev`/`db push`** — the schema is
   shared team state on Supabase; see the migration-drift gotcha below.

4. Run it:
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`.

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase **session pooler**, port `5432` — see gotcha below |
| `DIRECT_URL` | Yes | Same session pooler host, also port `5432` — see gotcha below |
| `AUTH_SECRET` | Yes | Random secret; currently unused functionally (no working auth), but `env.mjs` still requires it |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Yes | General Google OAuth app |
| `GOOGLE_CALENDAR_CLIENT_ID` / `GOOGLE_CALENDAR_CLIENT_SECRET` | Yes (for calendar sync) | Can reuse the same OAuth app as above; needs Calendar API scopes enabled. Redirect URI: `{NEXT_PUBLIC_APP_URL}/api/calendar/google/callback` |
| `ENCRYPTION_KEY` | Yes | 32-byte hex, encrypts stored Google OAuth tokens (AES-256-GCM) |
| `RESEND_API_KEY` | **Yes** | `env.mjs` requires this non-empty even though older docs called it optional — a placeholder value is fine for local dev if you're not testing email |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` for local dev |
| `CRON_SECRET`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` | No | Optional |

### Gotcha: `DATABASE_URL` / `DIRECT_URL` must both use the session pooler on port 5432

Supabase's real "direct connection" host (`db.<project-ref>.supabase.co:5432`) is
**IPv6-only** — unreachable on most networks/machines without an IPv4 add-on. Point both
vars at the **session pooler** instead (same host as the transaction pooler, different
port):

```
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres?sslmode=require"
```

Do **not** use the transaction pooler (port `6543`) for either — Prisma's schema engine
hangs or throws `prepared statement "s1" already exists` against it. That port is fine for
`DATABASE_URL` at runtime in a serverless/edge deployment (with `?pgbouncer=true` appended),
but this app deploys as a long-running server, so there's no reason to use it locally.

### Gotcha: both `.env` and `.env.local` need the real values

`prisma.config.ts` loads env vars via plain `import "dotenv/config"`, which only reads
`.env` — not `.env.local`. Next.js itself reads both. Keep them in sync or Prisma CLI
commands will silently use stale/missing values while the app "works."

### Gotcha: migration drift is a real risk with a shared Supabase project

Multiple people can run `prisma migrate dev` against the same Supabase database. If your
local `prisma/migrations/` folder doesn't match what Supabase's `_prisma_migrations` table
has recorded, `prisma migrate status` will tell you. **Don't run `migrate dev` or `db push`
to "fix" a mismatch without checking with the team first** — reconstruct the missing
migration file from whoever actually ran it, or `prisma db pull` + `prisma migrate diff` to
capture what's live, rather than guessing.

## Docker

`docker-compose.yml` and the `Dockerfile` exist from the original GudCal template and spin
up a **local Postgres container**, not Supabase — `DATABASE_URL` there points at
`db:5432` inside the compose network. This hasn't been tested against ClearPillar's actual
Supabase-based setup or the current schema; treat it as unverified rather than a working
path until someone updates it to point at Supabase (or decides local Postgres is fine for
Docker-based dev specifically).

## MCP Server

GudCal's original template included a built-in MCP server (`lib/mcp/server.ts`) for AI
agent scheduling. It was removed along with the rest of the generic demo app since it was
built entirely against the old `Booking`/`EventType` models — not currently available.
