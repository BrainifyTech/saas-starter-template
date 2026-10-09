// jobs: work that runs after the request that asked for it has returned.
//
// pg-boss keeps the queue in the app's own Postgres (schema `pgboss`), so a
// job survives a restart and adds no service: in a RapidBuild run it is the
// run's embedded database, locally the compose Postgres, in production
// Render's. The starter had no background work; this is the declared place
// for it. A story that needs a different queue service is a new capability,
// which is a question for the builder, not a change to this file.

import PgBoss from "pg-boss";
import { env } from "@/env";

let starting: Promise<PgBoss> | null = null;

function boss(): Promise<PgBoss> {
  if (!starting) {
    const b = new PgBoss({ connectionString: env.DATABASE_URL, schema: "pgboss" });
    b.on("error", (err) => console.error("[jobs]", err));
    starting = b.start().then(() => b);
  }
  return starting;
}

// Queue a job. Returns its id.
export async function enqueue(name: string, payload: object): Promise<string> {
  const b = await boss();
  await b.createQueue(name);
  const id = await b.send(name, payload);
  if (!id) throw new Error(`pg-boss did not accept a ${name} job`);
  return id;
}

// Run `handler` for every job queued under `name`, in this process.
export async function work<T extends object>(
  name: string,
  handler: (payload: T) => Promise<void>
): Promise<void> {
  const b = await boss();
  await b.createQueue(name);
  await b.work<T>(name, async (jobs) => {
    for (const job of jobs) await handler(job.data);
  });
}

// Take one waiting job without a worker (tests, and draining by hand).
export async function takeOne<T extends object>(name: string): Promise<{ id: string; data: T } | null> {
  const b = await boss();
  const [job] = await b.fetch<T>(name);
  if (!job) return null;
  await b.complete(name, job.id);
  return { id: job.id, data: job.data };
}

export async function stopJobs(): Promise<void> {
  if (!starting) return;
  const b = await starting;
  starting = null;
  await b.stop({ graceful: false, wait: true });
}
