import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { isAdmin?: boolean } | undefined

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      phone: true,
      streetAddress: true,
      city: true,
      state: true,
      zipCode: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { bids: true, wonItems: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { isAdmin?: boolean } | undefined

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const { userId, firstName, lastName, email, phone, streetAddress, city, state, zipCode } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email: email.toLowerCase() }),
      ...(phone && { phone }),
      ...(streetAddress && { streetAddress }),
      ...(city && { city }),
      ...(state && { state }),
      ...(zipCode && { zipCode }),
    },
  })

  return NextResponse.json({ message: "User updated", user: updated })
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { isAdmin?: boolean } | undefined

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.watchlist.deleteMany({ where: { userId } })
    await tx.bid.deleteMany({ where: { userId } })
    await tx.payment.deleteMany({ where: { userId } })
    await tx.session.deleteMany({ where: { userId } })
    await tx.account.deleteMany({ where: { userId } })
    await tx.user.delete({ where: { id: userId } })
  })

  return NextResponse.json({ message: "User deleted" })
}
