import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder")
const FROM_EMAIL = process.env.EMAIL_FROM || "SACNS Auction <onboarding@resend.dev>"
const REPLY_TO = process.env.EMAIL_REPLY_TO || "elainph@gmail.com"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function plainTextToHtml(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br />\n")
}

const MAX_SUBJECT = 300
const MAX_BODY = 50_000

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const subject = typeof body.subject === "string" ? body.subject.trim() : ""
    const messageBody = typeof body.body === "string" ? body.body : ""
    const ccRaw = typeof body.cc === "string" ? body.cc.trim() : ""

    if (!subject || subject.length > MAX_SUBJECT) {
      return NextResponse.json(
        { error: `Subject is required (max ${MAX_SUBJECT} characters)` },
        { status: 400 }
      )
    }
    if (!messageBody || messageBody.length > MAX_BODY) {
      return NextResponse.json(
        { error: `Message is required (max ${MAX_BODY} characters)` },
        { status: 400 }
      )
    }

    const ccList = ccRaw
      ? ccRaw.split(",").map((e: string) => e.trim()).filter(Boolean)
      : []

    const sold = await prisma.item.findMany({
      where: { status: "SOLD", winnerId: { not: null } },
      select: {
        title: true,
        currentBid: true,
        startingBid: true,
        winner: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    type Group = {
      email: string
      firstName: string
      items: { title: string; amount: number }[]
    }
    const byEmail = new Map<string, Group>()

    for (const row of sold) {
      const w = row.winner
      if (!w?.email) continue
      const amount = row.currentBid ?? row.startingBid
      const existing = byEmail.get(w.email)
      if (existing) {
        existing.items.push({ title: row.title, amount })
      } else {
        byEmail.set(w.email, {
          email: w.email,
          firstName: w.firstName,
          items: [{ title: row.title, amount }],
        })
      }
    }

    if (byEmail.size === 0) {
      return NextResponse.json(
        { error: "No sold items with winners found. Nothing to send." },
        { status: 400 }
      )
    }

    const errors: string[] = []
    let sent = 0

    for (const [, group] of byEmail) {
      let personalized = messageBody
      personalized = personalized.replace(/\{\{firstName\}\}/gi, group.firstName)

      const itemsHtml = `
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #1e293b; font-weight: bold;">Your winning item(s)</p>
        <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Item</th>
              <th style="text-align: right; padding: 8px; border: 1px solid #e2e8f0;">Winning bid</th>
            </tr>
          </thead>
          <tbody>
            ${group.items
              .map(
                (it) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(it.title)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${it.amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <div style="line-height: 1.6;">${plainTextToHtml(personalized)}</div>
          ${itemsHtml}
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            Questions? Reply to this email or contact us at <a href="mailto:${REPLY_TO}" style="color: #7c3aed;">${REPLY_TO}</a>
          </p>
        </div>
      `

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          replyTo: REPLY_TO,
          to: group.email,
          ...(ccList.length > 0 ? { cc: ccList } : {}),
          subject,
          html,
        })
        sent++
        await new Promise((r) => setTimeout(r, 150))
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Send failed"
        errors.push(`${group.email}: ${msg}`)
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      totalRecipients: byEmail.size,
      errors: errors.length ? errors : undefined,
    })
  } catch (error) {
    console.error("Admin email winners error:", error)
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    )
  }
}
