// The capability set this template declares: the outside services a product
// built on it may use, each with the adapter that reaches the real provider
// and the local mock a fresh clone, a test run and a preview use instead.
//
// Why a declared set: RapidBuild's triage checks the services a story needs
// against the set its preset declares, and asks the builder a plain question
// ("this needs a new service") for one that is not here, rather than an
// operator widening the sandbox's egress by hand. The preset file names the
// same five with the same adapter and mock names; change both together.
//
// `database` is not in this list. It is the sixth capability the preset
// declares, and it is real Postgres everywhere (docker-compose.yml for the
// preview and production shape, an embedded Postgres inside a RapidBuild
// run), never a mock.

import { capabilityMode } from "@/env";

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
  // What runs locally in mock mode: no network, no account, no key.
  mock: string;
  // One line a builder could read.
  summary: string;
};

export const capabilities: Record<CapabilityName, Capability> = {
  auth: {
    name: "auth",
    adapter: "session-oauth",
    mock: "session-password",
    summary:
      "Sign-in. Live: the app's own session cookie with email/password, magic links, Google and GitHub. Mock: email/password and magic links only; Google and GitHub send you to email sign-in.",
  },
  email: {
    name: "email",
    adapter: "resend",
    mock: "mail-catcher",
    summary:
      "Sending email. Live: Resend. Mock: kept in memory and, when MAIL_CATCHER_URL is set, delivered to the mail-catcher so a link in it can be clicked.",
  },
  storage: {
    name: "storage",
    adapter: "r2",
    mock: "local-disk",
    summary:
      "Uploaded files. Live: Cloudflare R2 over the S3 API. Mock: files on local disk under MOCK_STORAGE_DIR, served by the app itself.",
  },
  jobs: {
    name: "jobs",
    adapter: "in-process",
    mock: "in-process",
    summary:
      "Work done after a request returns. Both modes run the job in the same process; there is no queue service yet.",
  },
  payments: {
    name: "payments",
    adapter: "stripe",
    mock: "fake-checkout",
    summary:
      "Taking money. Live: Stripe Checkout and its webhook. Mock: the upgrade button records a subscription straight away and lands on the success page.",
  },
};

export function isMock(): boolean {
  return capabilityMode === "mock";
}

// Which implementation of a capability this process is running.
export function implementationOf(name: CapabilityName): string {
  return isMock() ? capabilities[name].mock : capabilities[name].adapter;
}
