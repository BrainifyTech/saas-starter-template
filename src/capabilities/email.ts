// email: Resend live, the mail-catcher in mock mode.
//
// The mock keeps every message in an in-memory outbox (what a test reads) and,
// when MAIL_CATCHER_URL is set, also posts it to the catcher's HTTP send API,
// so a person trying the product can open a magic-link or verify-email
// message and click it. Nothing in mock mode reaches a real mail provider.

import { env } from "@/env";

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
};

export type SentEmail = OutgoingEmail & { from: string; at: Date };

const outbox: SentEmail[] = [];

export function mockOutbox(): readonly SentEmail[] {
  return outbox;
}

export function clearMockOutbox(): void {
  outbox.length = 0;
}

// "Name <address>" or a bare address, as EMAIL_FROM is written.
function parseFrom(from: string): { Email: string; Name?: string } {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { Name: m[1] || undefined, Email: m[2] } : { Email: from.trim() };
}

export async function sendMockEmail(message: OutgoingEmail): Promise<void> {
  const sent: SentEmail = { ...message, from: env.EMAIL_FROM, at: new Date() };
  outbox.push(sent);
  console.info(`[email:mock] to=${message.to} subject=${JSON.stringify(message.subject)}`);

  if (!env.MAIL_CATCHER_URL) return;
  // Mailpit's send API. A catcher that is down is an error the caller sees,
  // not a message quietly dropped: the sign-in flow depends on this mail.
  const res = await fetch(new URL("/api/v1/send", env.MAIL_CATCHER_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      From: parseFrom(env.EMAIL_FROM),
      To: [{ Email: message.to }],
      Subject: message.subject,
      HTML: message.html,
    }),
  });
  if (!res.ok) {
    throw new Error(`mail-catcher refused the message: HTTP ${res.status}`);
  }
}

// Newsletter contacts: Resend audiences live; remembered in memory in mock mode.
const mockContacts = new Set<string>();

export function mockContactList(): string[] {
  return [...mockContacts];
}

export async function addMockContact(email: string): Promise<void> {
  mockContacts.add(email.toLowerCase());
}
