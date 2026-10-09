// jobs: work that runs after the request that asked for it has returned.
//
// The starter has no background work and no queue service, so live and mock
// are the same in-process runner. It exists so a story that needs "send this
// later" has a declared place to put it; a story that needs durable jobs
// (survive a restart, retry tomorrow) needs a real adapter, which is a new
// service and so a question for the builder, not a change to this file.

type Handler = (payload: unknown) => Promise<void> | void;

const handlers = new Map<string, Handler>();
const pending = new Set<Promise<void>>();
let nextId = 1;

export function registerJob(name: string, handler: Handler): void {
  handlers.set(name, handler);
}

export function enqueue(name: string, payload: unknown): string {
  const handler = handlers.get(name);
  if (!handler) {
    throw new Error(`no job registered as ${JSON.stringify(name)}`);
  }
  const id = `job-${nextId++}`;
  const run = new Promise<void>((resolve) => setImmediate(resolve))
    .then(() => handler(payload))
    .catch((err) => {
      console.error(`[jobs] ${name} ${id} failed`, err);
    })
    .finally(() => pending.delete(run));
  pending.add(run);
  return id;
}

// Wait for every job enqueued so far. Tests use it; so can a shutdown hook.
export async function drain(): Promise<void> {
  while (pending.size) {
    await Promise.all([...pending]);
  }
}
