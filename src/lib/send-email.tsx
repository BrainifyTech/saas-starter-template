import { Resend } from "resend";
import { render } from "@react-email/components";

import { env } from "@/env";
import { emailTransport } from "@/capabilities";
import { sendLoggedEmail, sendSmtpEmail } from "@/capabilities/email";
import { ReactNode } from "react";

const resend = new Resend(env.EMAIL_SERVER_PASSWORD);

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactNode
) {
  const transport = emailTransport();
  if (transport !== "resend") {
    const message = { to: email, subject, html: await render(<>{body}</>) };
    await (transport === "smtp" ? sendSmtpEmail(message) : sendLoggedEmail(message));
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    react: <>{body}</>,
  });

  if (error) {
    throw error;
  }
}

// TODO: implement me
// export async function batchSendEmails(
//   emails: {
//     to: string;
//     subject: string;
//     body: ReactNode;
//   }[]
// ) {
//   const { error } = await resend.batch.send(
//     emails.map((email) => ({
//       from: EMAIL_FROM,
//       to: email.to,
//       subject: email.subject,
//       react: email.body,
//     })
//   );
//   if (error) {
//     throw error;
//   }
// }
