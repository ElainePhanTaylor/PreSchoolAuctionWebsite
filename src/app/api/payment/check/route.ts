import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Request to pay by check
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 })
    }

    const user = session.user as { id: string }
    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    // Get the item
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { payment: true },
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

    // Get auction settings for check instructions
    const settings = await prisma.auctionSettings.findFirst()

    // Amount is the winning bid, calculated SERVER-SIDE
    const amount = item.currentBid ?? item.startingBid

    // Create or update payment record for check
    await prisma.payment.upsert({
      where: { itemId: item.id },
      create: {
        amount,
        method: "CHECK",
        status: "PENDING",
        userId: user.id,
        itemId: item.id,
      },
      update: {
        method: "CHECK",
        status: "PENDING",
      },
    })

    return NextResponse.json({
      success: true,
      checkInstructions: {
        payableTo: settings?.checkPayableTo ?? "San Anselmo Cooperative Nursery School",
        mailingAddress: settings?.checkMailingAddress ?? "24 Myrtle Lane, San Anselmo, CA 94960",
        amount,
        deadlineDays: settings?.checkDeadlineDays ?? 14,
        itemTitle: item.title,
      },
    })
  } catch (error) {
    console.error("Check payment error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
