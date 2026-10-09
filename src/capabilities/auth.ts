// auth: the app's own session cookie, with or without the OAuth providers.
//
// Email/password and magic-link sign-in need no outside service (the magic
// link travels through the email capability, so in mock mode it lands in the
// mail-catcher), and they are the mock. Google and GitHub need a registered
// OAuth app and a public callback URL, which a fresh clone or a preview does
// not have; in mock mode their routes send the person to email sign-in
// instead of to a provider error page.

import { isMock } from "./index";

export function oauthAvailable(): boolean {
  return !isMock();
}

// A relative redirect: a preview is reached through a proxy origin the app
// does not know, so an absolute URL built from HOST_NAME would leave it.
export function oauthUnavailableResponse(): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: "/sign-in/email" },
  });
}
