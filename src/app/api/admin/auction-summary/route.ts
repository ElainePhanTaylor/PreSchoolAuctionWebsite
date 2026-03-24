import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function salePrice(currentBid: number | null, startingBid: number) {
  return currentBid ?? startingBid
}

// GET: Sold / unsold lists and totals (post–end-auction style)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const [soldItems, unsoldItems] = await Promise.all([
      prisma.item.findMany({
        where: { status: "SOLD" },
        select: {
          id: true,
          title: true,
          currentBid: true,
          startingBid: true,
          winner: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
        orderBy: { title: "asc" },
      }),
      prisma.item.findMany({
        where: { status: "UNSOLD" },
        select: {
          id: true,
          title: true,
          startingBid: true,
        },
        orderBy: { title: "asc" },
      }),
    ])

    const sold = soldItems.map((item) => {
      const price = salePrice(item.currentBid, item.startingBid)
      const winner = item.winner
      return {
        id: item.id,
        title: item.title,
        salePrice: price,
        winnerName: winner
          ? `${winner.firstName} ${winner.lastName}`.trim()
          : null,
        winnerUsername: winner?.username ?? null,
      }
    })

    const unsold = unsoldItems.map((item) => ({
      id: item.id,
      title: item.title,
      startingBid: item.startingBid,
    }))

    const totalSoldAmount = sold.reduce((sum, row) => sum + row.salePrice, 0)

    return NextResponse.json({
      sold,
      unsold,
      totals: {
        soldCount: sold.length,
        unsoldCount: unsold.length,
        totalSoldAmount,
      },
    })
  } catch (error) {
    console.error("Admin auction summary error:", error)
    return NextResponse.json(
      { error: "Failed to fetch auction summary" },
      { status: 500 }
    )
  }
}
