import { Resend } from "resend";

import { env } from "@/env";
import { isMock } from "@/capabilities";
import { addMockContact } from "@/capabilities/email";

const resend = new Resend(env.EMAIL_SERVER_PASSWORD);

export async function subscribeEmail(email: string) {
  if (isMock()) {
    await addMockContact(email);
    return;
  }
  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    audienceId: env.RESEND_AUDIENCE_ID,
  });
  if (error) {
    console.error(error);
    throw error;
  }
}
