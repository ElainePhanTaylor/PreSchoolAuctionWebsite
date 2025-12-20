import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testEmail = searchParams.get("to") || "elainph@gmail.com"
  
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  console.log("Sending test email to:", testEmail)
  
  try {
    const result = await resend.emails.send({
      from: "SACNS Auction <onboarding@resend.dev>",
      to: testEmail,
      subject: "Test Email from Auction Site",
      html: `<h1>Test</h1><p>If you see this, emails to ${testEmail} are working!</p>`,
    })
    
    console.log("Email result:", JSON.stringify(result))
    return NextResponse.json({ success: true, to: testEmail, result })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json({ success: false, to: testEmail, error: String(error) })
  }
}
