import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendNewDonationNotification, sendDonationConfirmation } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const { 
      title, 
      description, 
      category, 
      estimatedValue, 
      photos,
      // Guest donor fields (for non-logged-in users)
      donorName,
      donorEmail,
      donorPhone,
    } = body

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      )
    }

    // If not logged in, require donor contact info
    if (!session?.user && (!donorName || !donorEmail)) {
      return NextResponse.json(
        { error: "Please provide your name and email" },
        { status: 400 }
      )
    }

    // Determine donor info
    const isLoggedIn = !!session?.user
    const finalDonorName = isLoggedIn ? session.user.name : donorName
    const finalDonorEmail = isLoggedIn ? session.user.email : donorEmail

    // Create the item
    const itemData: any = {
      title,
      description,
      category,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
      startingBid: estimatedValue ? parseFloat(estimatedValue) * 0.5 : 25,
      status: "PENDING",
      donorName: finalDonorName, // Store donor name on item for guests
    }

    // If logged in, link to user account
    if (isLoggedIn) {
      itemData.donorId = session.user.id
    } else {
      // For guests, we need a placeholder donor or handle differently
      // For now, we'll create a temporary approach
      // In production, you might want to create a guest user or handle this differently
      
      // Find or create a "guest" user for unregistered donations
      let guestUser = await prisma.user.findFirst({
        where: { email: "guest@auction.local" }
      })
      
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: "guest@auction.local",
            username: "Guest Donors",
            passwordHash: "not-applicable",
          }
        })
      }
      
      itemData.donorId = guestUser.id
      itemData.donorName = `${donorName} (${donorEmail})`
    }

    // Add photos if provided
    if (photos && photos.length > 0) {
      itemData.photos = {
        create: photos.map((url: string, index: number) => ({
          url,
          order: index,
        })),
      }
    }

    const item = await prisma.item.create({
      data: itemData,
      include: {
        photos: true,
      },
    })

    // Send email notifications (don't block on these)
    if (finalDonorEmail) {
      // Notify admins
      sendNewDonationNotification({
        itemTitle: title,
        donorName: finalDonorName || "Anonymous",
        donorEmail: finalDonorEmail,
        category,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      }).catch(console.error)

      // Send confirmation to donor
      sendDonationConfirmation({
        donorEmail: finalDonorEmail,
        donorName: finalDonorName || "Donor",
        itemTitle: title,
      }).catch(console.error)
    }

    return NextResponse.json({
      message: "Item submitted successfully! An admin will review it shortly.",
      item,
    })
  } catch (error) {
    console.error("Create item error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
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
