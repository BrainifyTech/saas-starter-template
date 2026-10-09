# AGENTS.md

How to work in this repository, for an agent or a person new to it. It is a
Next.js 15 (App Router) SaaS on Drizzle and Postgres, generated from
`BrainifyTech/saas-starter-template`.

## Commands

Node 22, npm, `package-lock.json` committed. Everything below runs from the
repository root.

| What | Command | Notes |
|---|---|---|
| install | `npm ci --no-audit --no-fund --ignore-scripts` | dependency scripts stay off |
| setup | `npm run postinstall --if-present` | writes `.source/` (the MDX types lint reads); run once after install |
| lint | `npm run lint` | `next lint`, then `tsc --noEmit`; both must be clean |
| test | `npm run test` | migrates and seeds `DATABASE_URL`, then runs `tests/**/*.test.ts` with node:test through tsx |
| browser suite | `npm run test:e2e` | Playwright, `e2e/`; starts `npm run dev` itself, or set `E2E_BASE_URL` to drive a running app |
| build | `npm run build` | `next build` |
| start | `npm run dev` | port 3000 |
| migrate | `npm run db:migrate` | applies `drizzle/` to `DATABASE_URL` |
| seed | `npm run db:seed` | one user, `testing@example.com` / `12345678`, with a profile and a group; safe to run twice |
| migration check | `npm run db:check` | `drizzle-kit check`, then the two-heads check |

`test` needs Postgres. Locally, `docker compose up -d` gives one on
`postgresql://postgres:example@localhost:5432/postgres`. Inside a RapidBuild
run, the run's own Postgres 16 is already in `DATABASE_URL`. A test that
needs the database fails when there is none; it is never skipped.

## What "verify" means

A change is verified when install, setup, lint and test each exit 0 on it, as
they did on the base. The same commands run here, in CI
(`.github/workflows/ci.yml`) and in a RapidBuild run (`.rapidbuild.yml`), so a
green in one place means the same as a green in another. CI also runs the
build, the browser suite, and a check that `npm run db:generate` produces
nothing.

## The database and its migrations

- The schema is `src/db/schema.ts`. Migrations live in `drizzle/`: one
  `<id>_<name>.sql` per migration, plus `drizzle/meta/` (`_journal.json` and
  one `<id>_snapshot.json` each).
- **Every schema change ships its migration in the same change.** Edit
  `schema.ts`, run `npm run db:generate`, commit everything it wrote under
  `drizzle/`. Never hand-write a migration or edit one that is already on
  `main`. A schema change without its migration passes type checks and then
  500s every page that reads the new table; CI refuses it.
- New migrations are named by timestamp (`20261009120000_add_pins.sql`;
  `drizzle.config.ts` sets this). The four `0000`–`0003` files are the
  starter's and keep their names.
- The history must be one line. `npm run db:check` refuses two migrations
  generated from the same parent, which is what two branches each adding a
  migration produce. To fix it, delete your branch's generated files and run
  `npm run db:generate` again on top of the other branch's migration.
- `db:generate` needs no database and no environment. Do not run
  `drizzle-kit up` or `db:push`: the snapshots are current, and push changes
  a database without a migration.

## Outside services: the capability set

The product may use five outside services, declared in
`src/capabilities/index.ts`. Each has a real adapter and a local mock, and
outside a production build the mock is the default, so the app runs with
nothing but `DATABASE_URL`:

| Capability | Live | Mock | Switch |
|---|---|---|---|
| auth | session cookie, email/password, magic link, Google, GitHub | email/password and magic link; Google/GitHub redirect to email sign-in | `NEXT_PUBLIC_CAPABILITY_MODE` |
| email | Resend | `log` (server log and an in-memory outbox) or `smtp` (Mailpit from `docker-compose.yml`, inbox on :8025) | `EMAIL_TRANSPORT` |
| storage | Cloudflare R2 | `local`: files under `MOCK_STORAGE_DIR`, served by `/api/mock-storage/` | `STORAGE_ADAPTER` |
| jobs | pg-boss on the app's Postgres | the same, on whatever Postgres the app has | — |
| payments | Stripe Checkout and its webhook | `fake`: upgrade writes the subscription the webhook would and lands on `/success` | `PAYMENTS_ADAPTER` |

`NEXT_PUBLIC_CAPABILITY_MODE` (`mock` or `live`) sets the default for all of
them. A production build defaults to `live`, which requires every provider
key in `src/env.ts`.

Rules:

- Reach a service only through its capability module or the `src/lib`
  function that already dispatches on it (`sendEmail`, `uploadFileToBucket`,
  …). Never call a provider SDK from a page or a use-case.
- A feature that needs a service outside these five, or the database, is not
  something to add quietly. Say so and stop: it is a question for the
  person who owns the product. Do not add a dependency, a host or a key for
  it.
- Tests run on the mocks. A test that would contact a real provider is wrong.

## The brand

`brand/brand.json` has four slots, and they are the only brand values the
product sets: `product_name`, `logo` (`null`, or a file under `public/`
such as `/brand/logo.svg`), `primary_color` (`#rrggbb`) and `tone` (one line
describing how copy should sound). `src/brand/index.ts` reads them and
derives the light and dark palettes from the one colour. Do not hard-code
the product's name or colour anywhere else, and do not add a slot. When you
write copy, follow `tone`.

## Where things are

- Pages and routes: `src/app/` (`(main)` is the product, `(docs)` the docs).
- Business rules: `src/use-cases/`. Database access: `src/data-access/`.
  A page calls a use-case and a use-case calls data-access. Data-access is
  meant to be the only layer that imports `@/db`; `src/auth.ts`,
  `use-cases/posts.ts` and `use-cases/authorization.ts` already break that,
  and new code should not.
- Server actions sit beside their page in `actions.ts`, built on
  `src/lib/safe-action.ts`.
- Environment: `src/env.ts` validates every variable at import.
  `.env.sample` lists them. Never commit `.env`.
- Tests: `tests/` (unit and database, `npm run test`) and `e2e/` (browser,
  `npm run test:e2e`).

## Releasing

Nothing deploys on push. A person runs the **Deploy** workflow
(`.github/workflows/deploy.yml`) from `main` and picks staging or
production. Render builds the commit, runs `npm run db:migrate` itself, and
swaps it in (`render.yaml`). Do not change the deploy workflow, `render.yaml`
or CI to deploy automatically, and never run a migration against a hosted
database yourself.
