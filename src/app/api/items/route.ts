import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can create items
    const user = session.user as { id: string; isAdmin?: boolean }
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { title, description, category, estimatedValue, startingBid, isFeatured, photos } = await request.json()

    if (!title || !description || !category || !photos || photos.length === 0) {
      return NextResponse.json(
        { error: "Title, description, category, and at least one photo are required" },
        { status: 400 }
      )
    }

    // Calculate starting bid if not provided (round to nearest $5)
    const roundToFive = (n: number) => Math.round(n / 5) * 5
    const calculatedStartingBid = startingBid 
      ? parseFloat(startingBid) 
      : roundToFive(estimatedValue ? estimatedValue * 0.5 : 25)

    // Create the item
    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        estimatedValue: estimatedValue || null,
        startingBid: calculatedStartingBid,
        isFeatured: isFeatured || false,
        donorId: user.id,
        status: "APPROVED", // Admin-created items go live immediately
        photos: {
          create: photos.map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
      },
      include: {
        photos: true,
      },
    })

    return NextResponse.json({
      message: "Item submitted successfully",
      item,
    })
  } catch (error) {
    console.error("Create item error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const status = searchParams.get("status") || "APPROVED"

    const items = await prisma.item.findMany({
      where: {
        status: status as any,
        ...(category && category !== "ALL" && { category: category as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        photos: { orderBy: { order: "asc" } },
        bids: { orderBy: { amount: "desc" }, take: 1 },
        donor: { select: { username: true } },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Get items error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

