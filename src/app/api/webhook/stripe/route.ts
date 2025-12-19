import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const itemId = session.metadata?.itemId
    const userId = session.metadata?.userId

    if (itemId && userId) {
      // Update payment status
      await prisma.payment.update({
        where: { itemId },
        data: {
          status: "COMPLETED",
          stripeId: session.id,
        },
      })

      // Update item status to SOLD
      await prisma.item.update({
        where: { id: itemId },
        data: { status: "SOLD" },
      })

      // TODO: Send confirmation email
      // await sendPaymentConfirmationEmail(userId, itemId)

      console.log(`Payment completed for item ${itemId} by user ${userId}`)
    }
  }

  return NextResponse.json({ received: true })
}
