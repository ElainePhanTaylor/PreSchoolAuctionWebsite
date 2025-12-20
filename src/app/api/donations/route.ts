import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 })
    }

    const user = session.user as { id: string }
    const { title, description, category, estimatedValue, photos } = await request.json()

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      )
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: "At least one photo is required" },
        { status: 400 }
      )
    }

    // Calculate starting bid (50% of estimated value, rounded to nearest $5, min $25)
    let startingBid = 25
    if (estimatedValue) {
      startingBid = Math.max(25, Math.round((estimatedValue * 0.5) / 5) * 5)
    }

    // Create the item with PENDING status (needs admin approval)
    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        estimatedValue: estimatedValue || null,
        startingBid,
        status: "PENDING", // Requires admin approval
        donorId: user.id,
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
      success: true,
      message: "Donation submitted for review",
      item: {
        id: item.id,
        title: item.title,
      },
    })
  } catch (error) {
    console.error("Donation submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit donation" },
      { status: 500 }
    )
  }
}
