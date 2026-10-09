import { env } from "@/env";
import Stripe from "stripe";

export const stripe = new Stripe(env.STRIPE_API_KEY, {
  // The account was set up on this version; the SDK types only its newest
  // one. The cast keeps the pinned version (and its webhook payload shape)
  // rather than silently upgrading it to satisfy the type checker.
  apiVersion: "2024-04-10" as Stripe.LatestApiVersion,
  typescript: true,
});
