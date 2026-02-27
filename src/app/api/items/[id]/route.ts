import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET single item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: "asc" } },
        donor: { select: { username: true } },
        _count: { select: { bids: true } },
        payment: { select: { status: true, method: true } },
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Only show approved or sold items to non-admins
    const publicStatuses = ["APPROVED", "SOLD", "UNSOLD"]
    if (!publicStatuses.includes(item.status)) {
      const session = await getServerSession(authOptions)
      const user = session?.user as { isAdmin?: boolean } | undefined
      if (!user?.isAdmin) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Get item error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// PATCH update item (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id: string; isAdmin?: boolean } | undefined

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const updates = await request.json()
    const { removePhotoUrls, addPhotoUrls, ...rest } = updates

    // Whitelist allowed fields
    const allowedFields = [
      "title", "description", "category", "estimatedValue",
      "startingBid", "isFeatured", "status", "donorName"
    ]
    
    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (rest[field] !== undefined) {
        data[field] = rest[field]
      }
    }

    // Handle photo removals
    if (removePhotoUrls && Array.isArray(removePhotoUrls) && removePhotoUrls.length > 0) {
      await prisma.photo.deleteMany({
        where: { itemId: id, url: { in: removePhotoUrls } },
      })
    }

    // Handle photo additions
    if (addPhotoUrls && Array.isArray(addPhotoUrls) && addPhotoUrls.length > 0) {
      const existingPhotos = await prisma.photo.count({ where: { itemId: id } })
      await prisma.photo.createMany({
        data: addPhotoUrls.map((url: string, i: number) => ({
          itemId: id,
          url,
          order: existingPhotos + i,
        })),
      })
    }

    const item = await prisma.item.update({
      where: { id },
      data,
      include: {
        photos: { orderBy: { order: "asc" } },
        _count: { select: { bids: true } },
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Update item error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// DELETE item (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { isAdmin?: boolean } | undefined

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { itemId: id } })
      await tx.watchlist.deleteMany({ where: { itemId: id } })
      await tx.photo.deleteMany({ where: { itemId: id } })
      await tx.bid.deleteMany({ where: { itemId: id } })
      await tx.item.delete({ where: { id } })
    })

    return NextResponse.json({ message: "Item deleted" })
  } catch (error) {
    console.error("Delete item error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
