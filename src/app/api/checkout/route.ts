import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 })
    }

    const user = session.user as { id: string; email: string }
    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    // Get the item
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        photos: { take: 1, orderBy: { order: "asc" } },
        payment: true,
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Verify user is the winner
    if (item.winnerId !== user.id) {
      return NextResponse.json(
        { error: "You are not the winner of this item" },
        { status: 403 }
      )
    }

    // Check if already paid
    if (item.payment?.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This item has already been paid for" },
        { status: 400 }
      )
    }

    // Amount is the winning bid (currentBid), calculated SERVER-SIDE
    const amount = item.currentBid ?? item.startingBid

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.title,
              description: `Auction item - ${item.title}`,
              images: item.photos[0]?.url ? [item.photos[0].url] : [],
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        itemId: item.id,
        userId: user.id,
      },
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/auction/${item.id}?payment=cancelled`,
    })

    // Create or update payment record
    await prisma.payment.upsert({
      where: { itemId: item.id },
      create: {
        amount,
        method: "STRIPE",
        status: "PENDING",
        stripeId: checkoutSession.id,
        userId: user.id,
        itemId: item.id,
      },
      update: {
        stripeId: checkoutSession.id,
        status: "PENDING",
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
