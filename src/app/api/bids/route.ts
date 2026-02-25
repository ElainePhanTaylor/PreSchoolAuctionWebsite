import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendOutbidEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // 1. Verify user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Please log in to place a bid" }, { status: 401 })
    }

    const user = session.user as { id: string }
    const { itemId, amount } = await request.json()

    // Validate input
    if (!itemId || typeof amount !== "number") {
      return NextResponse.json({ error: "Item ID and bid amount are required" }, { status: 400 })
    }

    // Validate amount is a safe number
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid bid amount" }, { status: 400 })
    }

    // Run entire bid flow inside a serializable transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id: itemId },
        include: {
          bids: {
            orderBy: { amount: "desc" },
            take: 1,
            include: { user: { select: { id: true, email: true, username: true } } }
          }
        }
      })

      if (!item) {
        return { error: "Item not found", status: 404 } as const
      }

      if (item.status !== "APPROVED") {
        return { error: "This item is not available for bidding", status: 400 } as const
      }

      const settings = await tx.auctionSettings.findFirst()
      const minIncrement = settings?.minBidIncrement ?? 10
      const antiSnipingMinutes = settings?.antiSnipingMinutes ?? 2
      const auctionEndTime = settings?.auctionEndTime

      if (auctionEndTime && new Date() > auctionEndTime) {
        return { error: "The auction has ended", status: 400 } as const
      }

      const currentHighBidder = item.bids[0]?.user
      if (currentHighBidder && currentHighBidder.id === user.id) {
        return { error: "You already have the highest bid! No need to bid again.", status: 400 } as const
      }

      const currentBid = item.currentBid ?? item.startingBid
      const minBid = currentBid + minIncrement

      if (amount < minBid) {
        return {
          error: `Minimum bid is $${minBid}. Please bid at least $${minIncrement} more than the current bid.`,
          status: 400,
        } as const
      }

      // Anti-sniping: extend auction if bid is within X minutes of end
      let newEndTime = auctionEndTime
      if (auctionEndTime) {
        const msUntilEnd = auctionEndTime.getTime() - Date.now()
        const antiSnipingMs = antiSnipingMinutes * 60 * 1000

        if (msUntilEnd > 0 && msUntilEnd < antiSnipingMs) {
          newEndTime = new Date(Date.now() + antiSnipingMs)
          if (settings) {
            await tx.auctionSettings.update({
              where: { id: settings.id },
              data: { auctionEndTime: newEndTime }
            })
          }
        }
      }

      const previousHighBidder = item.bids[0]?.user

      const bid = await tx.bid.create({
        data: {
          amount,
          userId: user.id,
          itemId: item.id,
        }
      })

      await tx.item.update({
        where: { id: item.id },
        data: { currentBid: amount }
      })

      return {
        success: true,
        bid,
        item,
        previousHighBidder,
        auctionExtended: newEndTime !== auctionEndTime,
        newEndTime,
      } as const
    }, { isolationLevel: "Serializable" })

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    // Send outbid notification outside the transaction (non-critical)
    if (result.previousHighBidder && result.previousHighBidder.id !== user.id) {
      sendOutbidEmail(result.previousHighBidder.email, result.item.title, amount, result.item.id)
    }

    return NextResponse.json({
      message: "Bid placed successfully!",
      bid: {
        id: result.bid.id,
        amount: result.bid.amount,
        itemId: result.bid.itemId,
      },
      auctionExtended: result.auctionExtended,
      newEndTime: result.newEndTime,
    })

  } catch (error) {
    console.error("Place bid error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

// GET: Retrieve bids for an item or user's bids
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const userId = searchParams.get("userId")

    if (itemId) {
      // Get bids for a specific item
      const bids = await prisma.bid.findMany({
        where: { itemId },
        orderBy: { amount: "desc" },
        include: {
          user: { select: { username: true } }
        }
      })
      return NextResponse.json(bids)
    }

    if (userId) {
      // Get user's bids (requires auth)
      const session = await getServerSession(authOptions)
      if (!session?.user || (session.user as { id: string }).id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const bids = await prisma.bid.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          item: {
            select: { id: true, title: true, currentBid: true, status: true }
          }
        }
      })
      return NextResponse.json(bids)
    }

    return NextResponse.json({ error: "itemId or userId required" }, { status: 400 })

  } catch (error) {
    console.error("Get bids error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
