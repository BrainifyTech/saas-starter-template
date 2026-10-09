// payments: Stripe live, a fake checkout in mock mode.
//
// Live, the upgrade button sends the person to Stripe Checkout and the
// webhook records the subscription when Stripe confirms it. Mock, there is
// nobody to confirm, so the subscription the webhook would have written is
// written at once and the person lands on the same success page. The record
// has the same shape, so every "is this user premium" path runs unchanged.

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type FakeSubscription = {
  userId: number;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
};

export function fakeSubscription(
  userId: number,
  priceId: string,
  now: Date = new Date()
): FakeSubscription {
  return {
    userId,
    // Prefixed so a mock row can never be mistaken for a Stripe id.
    stripeSubscriptionId: `sub_mock_${userId}_${now.getTime()}`,
    stripeCustomerId: `cus_mock_${userId}`,
    stripePriceId: priceId,
    stripeCurrentPeriodEnd: new Date(now.getTime() + THIRTY_DAYS_MS),
  };
}
