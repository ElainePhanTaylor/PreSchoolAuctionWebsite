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

    console.log("=== END AUCTION DEBUG ===")
    console.log("Found items with APPROVED status:", items.length)
    items.forEach(item => {
      console.log(`- ${item.title}: ${item.bids.length} bids`)
      if (item.bids[0]) {
        console.log(`  Winner email: ${item.bids[0].user.email}`)
      }
    })

    const results = {
      itemsWithWinners: 0,
      itemsWithoutBids: 0,
      emailsSent: 0,
    }

    for (const item of items) {
      const highestBid = item.bids[0]

      if (highestBid) {
        console.log(`Processing winner for ${item.title}: ${highestBid.user.email}`)
        
        // Set winner and mark as sold (pending payment)
        await prisma.item.update({
          where: { id: item.id },
          data: {
            winnerId: highestBid.user.id,
            status: "SOLD",
          },
        })

        // Send winner email (await to ensure it sends before response)
        console.log(`Sending winner email to ${highestBid.user.email}...`)
        await sendWinnerEmail(
          highestBid.user.email,
          item.title,
          highestBid.amount,
          item.id
        )
        console.log(`Email sent for ${item.title}`)

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
