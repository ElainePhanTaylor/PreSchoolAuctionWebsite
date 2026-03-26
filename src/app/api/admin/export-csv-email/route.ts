import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { csvRow } from "@/lib/csv"
import { sendTreasurerCsvExport } from "@/lib/email"

const DEFAULT_TREASURER = "shabnazy@gmail.com"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const [users, soldItems] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true,
          streetAddress: true,
          city: true,
          state: true,
          zipCode: true,
          isAdmin: true,
          createdAt: true,
        },
      }),
      prisma.item.findMany({
        where: { status: "SOLD" },
        orderBy: { title: "asc" },
        include: {
          winner: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              username: true,
              phone: true,
              streetAddress: true,
              city: true,
              state: true,
              zipCode: true,
            },
          },
          payment: {
            select: {
              status: true,
              method: true,
              amount: true,
            },
          },
        },
      }),
    ])

    const userHeaders = [
      "id",
      "email",
      "firstName",
      "lastName",
      "username",
      "phone",
      "streetAddress",
      "city",
      "state",
      "zipCode",
      "isAdmin",
      "createdAt",
    ]
    const usersLines = [
      csvRow(userHeaders),
      ...users.map((u) =>
        csvRow([
          u.id,
          u.email,
          u.firstName,
          u.lastName,
          u.username,
          u.phone,
          u.streetAddress,
          u.city,
          u.state,
          u.zipCode,
          u.isAdmin,
          u.createdAt.toISOString(),
        ])
      ),
    ]
    const usersCsv = usersLines.join("\n")

    const winnerHeaders = [
      "itemId",
      "itemTitle",
      "category",
      "winningBid",
      "winnerEmail",
      "winnerFirstName",
      "winnerLastName",
      "winnerUsername",
      "winnerPhone",
      "streetAddress",
      "city",
      "state",
      "zipCode",
      "paymentStatus",
      "paymentMethod",
      "paymentAmount",
    ]
    const winnersLines = [
      csvRow(winnerHeaders),
      ...soldItems.map((item) => {
        const w = item.winner
        const bid = item.currentBid ?? item.startingBid
        const p = item.payment
        return csvRow([
          item.id,
          item.title,
          item.category,
          bid,
          w?.email ?? "",
          w?.firstName ?? "",
          w?.lastName ?? "",
          w?.username ?? "",
          w?.phone ?? "",
          w?.streetAddress ?? "",
          w?.city ?? "",
          w?.state ?? "",
          w?.zipCode ?? "",
          p?.status ?? "NONE",
          p?.method ?? "",
          p?.amount ?? "",
        ])
      }),
    ]
    const winnersCsv = winnersLines.join("\n")

    const to = process.env.EXPORT_TREASURER_EMAIL?.trim() || DEFAULT_TREASURER
    const ccRaw = process.env.EXPORT_TREASURER_CC_EMAILS?.trim()
    const cc = ccRaw
      ? ccRaw.split(",").map((e) => e.trim()).filter(Boolean)
      : undefined

    await sendTreasurerCsvExport({
      to,
      cc,
      usersCsv,
      winnersCsv,
    })

    return NextResponse.json({
      success: true,
      message: `Export emailed to ${to}${cc?.length ? ` (CC: ${cc.join(", ")})` : ""}`,
      counts: { users: users.length, soldItems: soldItems.length },
    })
  } catch (error) {
    console.error("Admin CSV export email error:", error)
    return NextResponse.json(
      { error: "Failed to generate or send export" },
      { status: 500 }
    )
  }
}
