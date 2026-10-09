// email: Resend live; `log` or `smtp` otherwise (EMAIL_TRANSPORT).
//
// log: the message goes to the server log and an in-memory outbox (what a
// test reads). It is what a RapidBuild run uses, because a run has no mail
// server and no egress to one.
// smtp: the message goes to EMAIL_SERVER_HOST:EMAIL_SERVER_PORT, which
// locally and in a preview is Mailpit from docker-compose.yml (1025), so a
// person trying the product can open a magic link and click it.
// Nothing but `resend` reaches a real mail provider.

import nodemailer from "nodemailer";
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

export async function sendLoggedEmail(message: OutgoingEmail): Promise<void> {
  outbox.push({ ...message, from: env.EMAIL_FROM, at: new Date() });
  console.info(`[email:log] to=${message.to} subject=${JSON.stringify(message.subject)}`);
}

export async function sendSmtpEmail(message: OutgoingEmail): Promise<void> {
  const port = Number(env.EMAIL_SERVER_PORT);
  const transport = nodemailer.createTransport({
    host: env.EMAIL_SERVER_HOST,
    port,
    secure: port === 465,
    auth: { user: env.EMAIL_SERVER_USER, pass: env.EMAIL_SERVER_PASSWORD },
  });
  // A catcher that is down is an error the caller sees, not a message quietly
  // dropped: sign-in depends on this mail arriving.
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to: message.to,
    subject: message.subject,
    html: message.html,
  });
}

// Newsletter contacts: Resend audiences live; remembered in memory otherwise.
const mockContacts = new Set<string>();

export function mockContactList(): string[] {
  return [...mockContacts];
}

export async function addMockContact(email: string): Promise<void> {
  mockContacts.add(email.toLowerCase());
}
