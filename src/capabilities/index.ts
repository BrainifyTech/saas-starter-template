// The capability set this template declares: the outside services a product
// built on it may use, each with the adapter that reaches the real provider
// and the local mock a fresh clone, a test run and a preview use instead.
//
// Why a declared set: RapidBuild's triage checks the services a story needs
// against the set its preset (presets/saas-starter/preset.yml) declares, and
// asks the builder a plain question ("this needs a new service") for one that
// is not here, rather than an operator widening the sandbox's egress by hand.
// The names and switches below are the preset's; change both together.
//
// `database` is the sixth capability the preset declares and is not here: it
// is real Postgres everywhere (an embedded Postgres 16 inside a RapidBuild
// run, docker-compose.yml for local work and the preview, Render's managed
// Postgres in production), never a mock.

import { capabilityMode, env } from "@/env";

export const CAPABILITY_NAMES = [
  "auth",
  "email",
  "storage",
  "jobs",
  "payments",
] as const;

export type CapabilityName = (typeof CAPABILITY_NAMES)[number];

export type Capability = {
  name: CapabilityName;
  // What reaches the real provider in live mode.
  adapter: string;
  // What runs locally in mock mode: no account, no key, no egress.
  mock: string;
  // The variable that picks one per process, when the capability has one.
  switch: "EMAIL_TRANSPORT" | "STORAGE_ADAPTER" | "PAYMENTS_ADAPTER" | null;
};

export const capabilities: Record<CapabilityName, Capability> = {
  // The app's own session cookie. Email/password and magic links need no
  // outside service and are the mock; Google and GitHub need a registered
  // OAuth app, so in mock mode their routes send the person to email sign-in.
  auth: { name: "auth", adapter: "session-oauth", mock: "session-password", switch: null },
  // resend live; log (server log plus an in-memory outbox) in a run; smtp to
  // the mail-catcher in docker-compose.yml locally and in a preview.
  email: { name: "email", adapter: "resend", mock: "log", switch: "EMAIL_TRANSPORT" },
  // Cloudflare R2 live; a directory under the working tree (MOCK_STORAGE_DIR)
  // otherwise, served back by /api/mock-storage/.
  storage: { name: "storage", adapter: "r2", mock: "local", switch: "STORAGE_ADAPTER" },
  // pg-boss keeps its queue in the app's own Postgres, so the adapter and the
  // mock are the same code on different databases and add no service.
  jobs: { name: "jobs", adapter: "pg-boss", mock: "pg-boss", switch: null },
  // Stripe live; fake writes the subscription the webhook would have written.
  payments: { name: "payments", adapter: "stripe", mock: "fake", switch: "PAYMENTS_ADAPTER" },
};

export function isMock(): boolean {
  return capabilityMode === "mock";
}

export function emailTransport(): "resend" | "smtp" | "log" {
  return env.EMAIL_TRANSPORT ?? (isMock() ? "log" : "resend");
}

export function storageAdapter(): "r2" | "local" {
  return env.STORAGE_ADAPTER ?? (isMock() ? "local" : "r2");
}

export function paymentsAdapter(): "stripe" | "fake" {
  return env.PAYMENTS_ADAPTER ?? (isMock() ? "fake" : "stripe");
}

// Which implementation of a capability this process is running.
export function implementationOf(name: CapabilityName): string {
  switch (name) {
    case "email":
      return emailTransport();
    case "storage":
      return storageAdapter();
    case "payments":
      return paymentsAdapter();
    case "auth":
      return isMock() ? capabilities.auth.mock : capabilities.auth.adapter;
    case "jobs":
      return capabilities.jobs.adapter;
  }
}
