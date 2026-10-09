import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Capability mode decides whether email, storage, payments, jobs and the OAuth
// half of auth reach real providers ("live") or the local mocks in
// src/capabilities ("mock"). It defaults to mock everywhere except a
// production build, so a fresh clone, a test run and a preview boot with
// nothing but DATABASE_URL; the starter used to refuse to render a single page
// until 28 provider variables were set (RapidBuild GF-03, 2026-10-08).
//
// NEXT_PUBLIC_ so the browser bundle and the server agree on the mode: it is
// inlined at build time, and a production image built with it set to "mock" is
// a demo that cannot send mail or take money, which is what a preview is.
export const capabilityMode: "mock" | "live" =
  (process.env.NEXT_PUBLIC_CAPABILITY_MODE ??
    (process.env.NODE_ENV === "production" ? "live" : "mock")) === "live"
    ? "live"
    : "mock";

const isMock = capabilityMode === "mock";

// A provider key: required in live mode; in mock mode a stand-in value that
// no mock ever sends anywhere.
const provider = (standIn: string) =>
  isMock ? z.string().min(1).default(standIn) : z.string().min(1);

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.string().optional(),
    HOST_NAME: isMock
      ? z.string().min(1).default("http://localhost:3000")
      : z.string().min(1),
    GOOGLE_CLIENT_ID: provider("mock-google-client-id"),
    GOOGLE_CLIENT_SECRET: provider("mock-google-client-secret"),
    GITHUB_CLIENT_ID: provider("mock-github-client-id"),
    GITHUB_CLIENT_SECRET: provider("mock-github-client-secret"),
    STRIPE_API_KEY: provider("sk_test_mock"),
    STRIPE_WEBHOOK_SECRET: provider("whsec_mock"),
    EMAIL_FROM: provider("Your product <hello@example.test>"),
    EMAIL_SERVER_HOST: provider("localhost"),
    EMAIL_SERVER_PORT: provider("1025"),
    EMAIL_SERVER_USER: provider("mock"),
    EMAIL_SERVER_PASSWORD: provider("re_mock"),
    RESEND_AUDIENCE_ID: provider("mock-audience"),
    CLOUDFLARE_ACCOUNT_ID: provider("mock-account"),
    CLOUDFLARE_ACCESS_KEY_ID: provider("mock-access-key"),
    CLOUDFLARE_SECRET_ACCESS_KEY: provider("mock-secret-key"),
    CLOUDFLARE_BUCKET_NAME: provider("mock-bucket"),
    // Mock-only knobs. MAIL_CATCHER_URL is the mail-catcher's HTTP API (Mailpit
    // in docker-compose.yml, http://localhost:8025); unset, mock mail is kept
    // in memory and logged. MOCK_STORAGE_DIR is where mock uploads land.
    MAIL_CATCHER_URL: z.string().url().optional(),
    MOCK_STORAGE_DIR: z.string().min(1).default(".data/storage"),
  },
  client: {
    NEXT_PUBLIC_CAPABILITY_MODE: z.enum(["mock", "live"]).optional(),
    NEXT_PUBLIC_STRIPE_KEY: provider("pk_test_mock"),
    NEXT_PUBLIC_POSTHOG_KEY: provider("mock-posthog-key"),
    NEXT_PUBLIC_POSTHOG_HOST: provider("http://localhost:3000"),
    NEXT_PUBLIC_PRICE_ID_BASIC: provider("price_mock_basic"),
    NEXT_PUBLIC_PRICE_ID_PREMIUM: provider("price_mock_premium"),
    NEXT_PUBLIC_STRIPE_MANAGE_URL: provider("/dashboard/settings/subscription"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_PRICE_ID_BASIC: process.env.NEXT_PUBLIC_PRICE_ID_BASIC,
    NEXT_PUBLIC_PRICE_ID_PREMIUM: process.env.NEXT_PUBLIC_PRICE_ID_PREMIUM,
    NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
    HOST_NAME: process.env.HOST_NAME,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_ACCESS_KEY_ID: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    CLOUDFLARE_BUCKET_NAME: process.env.CLOUDFLARE_BUCKET_NAME,
    RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,
    MAIL_CATCHER_URL: process.env.MAIL_CATCHER_URL,
    MOCK_STORAGE_DIR: process.env.MOCK_STORAGE_DIR,
    NEXT_PUBLIC_CAPABILITY_MODE: process.env.NEXT_PUBLIC_CAPABILITY_MODE,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_STRIPE_MANAGE_URL: process.env.NEXT_PUBLIC_STRIPE_MANAGE_URL,
  },
});
