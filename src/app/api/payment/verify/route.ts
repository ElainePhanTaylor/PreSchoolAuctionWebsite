import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "No session ID" })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid") {
      // Make sure our database is updated
      const itemId = session.metadata?.itemId

      if (itemId) {
        await prisma.payment.update({
          where: { itemId },
          data: { status: "COMPLETED" },
        })

        await prisma.item.update({
          where: { id: itemId },
          data: { status: "SOLD" },
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, status: session.payment_status })
  } catch (error) {
    console.error("Payment verify error:", error)
    return NextResponse.json({ success: false, error: "Verification failed" })
  }
}
