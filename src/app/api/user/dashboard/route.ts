import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id

    // Get user's bids with item info
    const userBids = await prisma.bid.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            currentBid: true,
            startingBid: true,
            status: true,
            winnerId: true,
            photos: { take: 1, orderBy: { order: "asc" } },
          },
        },
      },
    })

    // Get items the user has won
    const wonItems = await prisma.item.findMany({
      where: { winnerId: userId },
      include: {
        photos: { take: 1, orderBy: { order: "asc" } },
        payment: { select: { status: true, method: true } },
      },
    })

    // Process bids to determine status
    const processedBids = userBids.map((bid) => {
      const isHighestBid = bid.amount === bid.item.currentBid
      const auctionEnded = bid.item.status === "SOLD" || bid.item.status === "UNSOLD"
      const isWinner = bid.item.winnerId === userId

      let status: "winning" | "outbid" | "won" | "lost"
      if (auctionEnded) {
        status = isWinner ? "won" : "lost"
      } else {
        status = isHighestBid ? "winning" : "outbid"
      }

      return {
        id: bid.id,
        amount: bid.amount,
        createdAt: bid.createdAt,
        itemId: bid.item.id,
        itemTitle: bid.item.title,
        itemPhoto: bid.item.photos[0]?.url || null,
        currentBid: bid.item.currentBid ?? bid.item.startingBid,
        status,
      }
    })

    // Remove duplicates (keep only latest bid per item)
    const uniqueBids = processedBids.reduce((acc, bid) => {
      if (!acc.find((b) => b.itemId === bid.itemId)) {
        acc.push(bid)
      }
      return acc
    }, [] as typeof processedBids)

    // Process won items
    const processedWonItems = wonItems.map((item) => ({
      id: item.id,
      title: item.title,
      photo: item.photos[0]?.url || null,
      winningBid: item.currentBid ?? item.startingBid,
      paymentStatus: item.payment?.status || "NOT_STARTED",
      paymentMethod: item.payment?.method || null,
    }))

    // Calculate stats
    const activeBids = uniqueBids.filter((b) => b.status === "winning" || b.status === "outbid").length
    const itemsWon = wonItems.length
    const itemsWinning = uniqueBids.filter((b) => b.status === "winning").length

    return NextResponse.json({
      bids: uniqueBids,
      wonItems: processedWonItems,
      stats: {
        activeBids,
        itemsWon,
        itemsWinning,
      },
    })
  } catch (error) {
    console.error("Dashboard data error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
