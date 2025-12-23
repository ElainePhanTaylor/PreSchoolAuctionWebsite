import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch pending donations
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const pendingItems = await prisma.item.findMany({
      where: { status: "PENDING" },
      include: {
        photos: { orderBy: { order: "asc" } },
        donor: { 
          select: { 
            username: true, 
            email: true,
            firstName: true,
            lastName: true,
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ items: pendingItems })
  } catch (error) {
    console.error("Fetch pending donations error:", error)
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
  }
}

// PATCH - Approve or reject a donation
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { itemId, action, startingBid } = await request.json()

    if (!itemId || !action) {
      return NextResponse.json({ error: "Item ID and action required" }, { status: 400 })
    }

    if (action === "approve") {
      // Update item status to APPROVED
      const item = await prisma.item.update({
        where: { id: itemId },
        data: { 
          status: "APPROVED",
          // Allow admin to set starting bid when approving
          ...(startingBid && { startingBid: Math.floor(Number(startingBid)) }),
        },
      })

      return NextResponse.json({ 
        success: true, 
        message: "Donation approved",
        item,
      })
    } else if (action === "reject") {
      // Delete the item (or could set to REJECTED status)
      await prisma.item.delete({
        where: { id: itemId },
      })

      return NextResponse.json({ 
        success: true, 
        message: "Donation rejected and removed",
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Update donation error:", error)
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 })
  }
}

