import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Fetch all sold items with winner and payment info
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

    // Get all sold items with winner info and payment status
    const soldItems = await prisma.item.findMany({
      where: { status: "SOLD" },
      include: {
        winner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            username: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            method: true,
            amount: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        photos: {
          take: 1,
          orderBy: { order: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    // Format the response
    const payments = soldItems.map((item) => ({
      itemId: item.id,
      itemTitle: item.title,
      itemPhoto: item.photos[0]?.url || null,
      winningBid: item.currentBid ?? item.startingBid,
      winner: item.winner
        ? {
            id: item.winner.id,
            name: `${item.winner.firstName} ${item.winner.lastName}`,
            displayName: item.winner.username,
            email: item.winner.email,
            phone: item.winner.phone,
          }
        : null,
      payment: item.payment
        ? {
            id: item.payment.id,
            status: item.payment.status,
            method: item.payment.method,
            amount: item.payment.amount,
            updatedAt: item.payment.updatedAt,
          }
        : null,
    }))

    // Calculate summary stats
    const stats = {
      totalSold: soldItems.length,
      totalPaid: payments.filter((p) => p.payment?.status === "COMPLETED").length,
      totalPending: payments.filter(
        (p) => !p.payment || p.payment.status === "PENDING"
      ).length,
      totalRevenue: payments
        .filter((p) => p.payment?.status === "COMPLETED")
        .reduce((sum, p) => sum + (p.payment?.amount || 0), 0),
      expectedRevenue: payments.reduce((sum, p) => sum + p.winningBid, 0),
    }

    return NextResponse.json({ payments, stats })
  } catch (error) {
    console.error("Admin payments fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

// PATCH: Mark a check payment as received
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { itemId, action } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    // Get the item to verify it exists and is sold
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { payment: true, winner: true },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (item.status !== "SOLD") {
      return NextResponse.json(
        { error: "Item is not sold" },
        { status: 400 }
      )
    }

    if (!item.winnerId) {
      return NextResponse.json(
        { error: "No winner for this item" },
        { status: 400 }
      )
    }

    const amount = item.currentBid ?? item.startingBid

    if (action === "mark_received") {
      // Mark check as received (complete the payment)
      await prisma.payment.upsert({
        where: { itemId },
        create: {
          itemId,
          userId: item.winnerId,
          amount,
          method: "CHECK",
          status: "COMPLETED",
        },
        update: {
          status: "COMPLETED",
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Payment marked as received",
      })
    } else if (action === "mark_pending") {
      // Revert to pending (in case of mistake)
      await prisma.payment.upsert({
        where: { itemId },
        create: {
          itemId,
          userId: item.winnerId,
          amount,
          method: "CHECK",
          status: "PENDING",
        },
        update: {
          status: "PENDING",
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Payment marked as pending",
      })
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Admin payment update error:", error)
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    )
  }
}
