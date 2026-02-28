import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendWinnerEmail } from "@/lib/email"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { isAdmin?: boolean } | undefined

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all approved items with bids
    const items = await prisma.item.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    })

    const results = {
      itemsWithWinners: 0,
      itemsWithoutBids: 0,
      emailsSent: 0,
    }

    for (const item of items) {
      const highestBid = item.bids[0]

      if (highestBid) {
        // Set winner and mark as sold (pending payment)
        await prisma.item.update({
          where: { id: item.id },
          data: {
            winnerId: highestBid.user.id,
            status: "SOLD",
          },
        })

        await sendWinnerEmail(
          highestBid.user.email,
          item.title,
          highestBid.amount,
          item.id
        )

        results.itemsWithWinners++
        results.emailsSent++
      } else {
        // No bids - mark as unsold
        await prisma.item.update({
          where: { id: item.id },
          data: { status: "UNSOLD" },
        })

        results.itemsWithoutBids++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auction ended. ${results.itemsWithWinners} items sold, ${results.itemsWithoutBids} unsold. ${results.emailsSent} winner emails sent.`,
      results,
    })
  } catch (error) {
    console.error("End auction error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
