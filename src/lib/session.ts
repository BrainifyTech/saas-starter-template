import "server-only";
import { AuthenticationError } from "@/app/(main)/util";
import { createSession, generateSessionToken, validateRequest } from "@/auth";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserId } from "@/use-cases/types";

const SESSION_COOKIE_NAME = "session";

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const allCookies = await cookies();
  allCookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const allCookies = await cookies();
  allCookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const allCookies = await cookies();
  const sessionCookie = allCookies.get(SESSION_COOKIE_NAME)?.value;
  return sessionCookie;
}

export const getCurrentUser = cache(async () => {
  const { user } = await validateRequest();
  return user ?? undefined;
});

// A signed-in page awaits this first. A visitor nobody signed in is sent to
// sign-in (307) instead of the page throwing: the starter threw, so every
// signed-in page answered that visitor 500 (RapidBuild GF-37 walk, A7, on a
// product's /dashboard/notes).
//
// The check stays in each page, not in src/middleware.ts or a layout.
// Middleware runs before routing, so an unknown URL under /dashboard would be
// sent to sign-in too instead of answering 404, and a layout runs for every
// URL a catch-all segment below it takes (dashboard/groups/[groupId]/
// [...not-found]). Either way a page that does not exist would look, from
// outside, like one behind sign-in.
export const assertAuthenticated = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
};

// For a server action, which has no page to leave: its caller gets the
// action's error, as it always did.
export const assertAuthenticatedOrThrow = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
};

export async function setSession(userId: UserId) {
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  await setSessionTokenCookie(token, session.expiresAt);
}
