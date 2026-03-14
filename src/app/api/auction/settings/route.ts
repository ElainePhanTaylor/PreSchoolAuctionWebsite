import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const settings = await prisma.auctionSettings.findFirst()
  return NextResponse.json({
    auctionEndTime: settings?.auctionEndTime ?? null,
  })
}
