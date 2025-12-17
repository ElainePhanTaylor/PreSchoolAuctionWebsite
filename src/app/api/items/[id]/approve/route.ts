import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be APPROVED or REJECTED" },
        { status: 400 }
      )
    }

    const item = await prisma.item.update({
      where: { id: params.id },
      data: { status: action },
      include: {
        donor: { select: { email: true, username: true } },
      },
    })

    // TODO: Send email notification to donor about approval/rejection

    return NextResponse.json({
      message: `Item ${action.toLowerCase()} successfully`,
      item,
    })
  } catch (error) {
    console.error("Approve item error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

