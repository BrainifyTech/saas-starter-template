import { defineConfig } from "drizzle-kit";

// Two choices here are deliberate, and both come from a run that could not
// write a migration (RapidBuild GF-02 walk, 2026-10-08):
//
// - The URL is read from the process, not through `@/env`. `drizzle-kit
//   generate` diffs the schema against the snapshots and never connects, yet
//   importing `@/env` made it demand every provider key the app validates, so
//   generation died on "Invalid environment variables" in a sandbox that had
//   none. Commands that do connect (migrate, push, studio) still need the
//   real DATABASE_URL and fail on the placeholder, which is the honest error.
// - New migrations are prefixed with a timestamp, not a sequence number. Two
//   stories on two branches each writing `0004_*` is a merge that looks clean
//   and leaves two heads; timestamps make that collision rare and
//   `npm run migrations:check` refuses the rest. The four index-prefixed
//   migrations the starter shipped stay as they are.
export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  migrations: {
    prefix: "timestamp",
  },
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://unset:unset@127.0.0.1:5432/unset",
  },
  verbose: true,
  strict: true,
});
