/**
 * Card checkout via Stripe. Set NEXT_PUBLIC_CARD_CHECKOUT_ENABLED=true in Railway when live Stripe is ready.
 * Default: disabled (check + Venmo only).
 */
export function isCardCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CARD_CHECKOUT_ENABLED === "true"
}

/** Venmo username without @ — shown as @name on the site */
export function getVenmoHandle(): string {
  const raw = process.env.NEXT_PUBLIC_VENMO_HANDLE?.trim() ?? ""
  if (!raw) return ""
  return raw.startsWith("@") ? raw.slice(1) : raw
}

export function getVenmoDisplay(): string {
  const h = getVenmoHandle()
  return h ? `@${h}` : ""
}

export const PAYMENT_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_PAYMENT_CONTACT_EMAIL?.trim() || "elainph@gmail.com"

/** Shown on item page and similar */
export const CARD_UNAVAILABLE_NOTICE =
  "Credit card payments are temporarily unavailable while we finalize our payment processor. Please use Venmo or check — thank you for your patience!"
