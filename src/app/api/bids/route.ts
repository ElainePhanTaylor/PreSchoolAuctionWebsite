import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // 2. Get item from database
    const item = await prisma.item.findUnique({
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
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // 3. Check if item is approved (active in auction)
    if (item.status !== "APPROVED") {
      return NextResponse.json({ error: "This item is not available for bidding" }, { status: 400 })
    }

    // 4. Get auction settings
    const settings = await prisma.auctionSettings.findFirst()
    const minIncrement = settings?.minBidIncrement ?? 10
    const antiSnipingMinutes = settings?.antiSnipingMinutes ?? 2
    const auctionEndTime = settings?.auctionEndTime

    // 5. Check if auction has ended
    if (auctionEndTime && new Date() > auctionEndTime) {
      return NextResponse.json({ error: "The auction has ended" }, { status: 400 })
    }

    // 6. Calculate minimum bid (server-side, never trust client)
    const currentBid = item.currentBid ?? item.startingBid
    const minBid = currentBid + minIncrement

    if (amount < minBid) {
      return NextResponse.json(
        { error: `Minimum bid is $${minBid}. Please bid at least $${minIncrement} more than the current bid.` },
        { status: 400 }
      )
    }

    // 7. Check anti-sniping: if bid is within X minutes of end, extend auction
    let newEndTime = auctionEndTime
    if (auctionEndTime) {
      const msUntilEnd = auctionEndTime.getTime() - Date.now()
      const antiSnipingMs = antiSnipingMinutes * 60 * 1000

      if (msUntilEnd > 0 && msUntilEnd < antiSnipingMs) {
        // Extend auction by anti-sniping minutes
        newEndTime = new Date(Date.now() + antiSnipingMs)
        
        // Update auction settings with new end time
        if (settings) {
          await prisma.auctionSettings.update({
            where: { id: settings.id },
            data: { auctionEndTime: newEndTime }
          })
        }
      }
    }

    // 8. Get previous high bidder for outbid notification
    const previousHighBidder = item.bids[0]?.user

    // 9. Create the bid
    const bid = await prisma.bid.create({
      data: {
        amount,
        userId: user.id,
        itemId: item.id,
      }
    })

    // 10. Update item's current bid
    await prisma.item.update({
      where: { id: item.id },
      data: { currentBid: amount }
    })

    // 11. TODO: Send outbid notification email to previous bidder
    // if (previousHighBidder && previousHighBidder.id !== user.id) {
    //   await sendOutbidEmail(previousHighBidder.email, item.title, amount)
    // }

    return NextResponse.json({
      message: "Bid placed successfully!",
      bid: {
        id: bid.id,
        amount: bid.amount,
        itemId: bid.itemId,
      },
      auctionExtended: newEndTime !== auctionEndTime,
      newEndTime: newEndTime,
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
