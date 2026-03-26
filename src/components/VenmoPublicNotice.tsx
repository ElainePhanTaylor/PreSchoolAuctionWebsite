"use client"

import { getVenmoDisplay } from "@/lib/payment-options"

/** Shown on every page when NEXT_PUBLIC_VENMO_HANDLE is set (Railway / env). */
export function VenmoPublicNotice() {
  const handle = getVenmoDisplay()
  if (!handle) return null

  return (
    <div className="bg-emerald-50 border-b border-emerald-100 py-2.5 px-4 text-center text-sm text-emerald-950">
      <span className="font-medium">Payments accepted via Venmo:</span>{" "}
      <span className="font-bold">{handle}</span>
      <span className="text-emerald-900/85"> — include the item name in the memo.</span>
    </div>
  )
}
