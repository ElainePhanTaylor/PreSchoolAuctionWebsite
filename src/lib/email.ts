import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder")

const FROM_EMAIL = process.env.EMAIL_FROM || "SACNS Auction <onboarding@resend.dev>"
const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

function ensureEmailConfigured() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured. Email cannot be sent.")
  }
  if (!process.env.NEXTAUTH_URL) {
    throw new Error("NEXTAUTH_URL is not configured. Email links will be broken.")
  }
}

export async function sendOutbidEmail(
  toEmail: string,
  itemTitle: string,
  newBidAmount: number,
  itemId: string
) {
  try {
    ensureEmailConfigured()
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `You've been outbid on "${itemTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">You've Been Outbid!</h2>
          <p>Someone has placed a higher bid on <strong>${itemTitle}</strong>.</p>
          <p style="font-size: 24px; color: #7c3aed;">New highest bid: <strong>$${newBidAmount}</strong></p>
          <p>Don't miss out! Place a new bid now:</p>
          <a href="${SITE_URL}/auction/${itemId}" 
             style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Bid Now
          </a>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            San Anselmo Cooperative Nursery School Auction
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send outbid email:", error)
  }
}

export async function sendWinnerEmail(
  toEmail: string,
  itemTitle: string,
  winningBid: number,
  itemId: string
) {
  try {
    ensureEmailConfigured()
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Congratulations! You won "${itemTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Congratulations!</h2>
          <p>You won the auction for <strong>${itemTitle}</strong>!</p>
          <p style="font-size: 24px; color: #059669;">Winning bid: <strong>$${winningBid}</strong></p>
          <p>Please complete your payment to claim your item:</p>
          <a href="${SITE_URL}/auction/${itemId}" 
             style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Pay Now
          </a>
          <p style="color: #64748b; font-size: 14px;">
            You can pay by credit card or check. Payment instructions are available on the item page.
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            Thank you for supporting San Anselmo Cooperative Nursery School!
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send winner email:", error)
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string
) {
  try {
    ensureEmailConfigured()
    const resetUrl = `${SITE_URL}/reset-password?token=${resetToken}`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Reset your password — SACNS Auction",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Reset Your Password</h2>
          <p>We received a request to reset your password for the SACNS Auction.</p>
          <p>Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #64748b; font-size: 14px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            San Anselmo Cooperative Nursery School Auction
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
  }
}

export async function sendPaymentConfirmationEmail(
  toEmail: string,
  itemTitle: string,
  amount: number,
  paymentMethod: "STRIPE" | "CHECK"
) {
  try {
    ensureEmailConfigured()
    const isStripe = paymentMethod === "STRIPE"
    
    const subject = isStripe 
      ? `Payment confirmed for "${itemTitle}"`
      : `Check Payment Instructions for "${itemTitle}"`
    
    const heading = isStripe ? "✅ Payment Confirmed" : "📝 Check Payment Instructions"
    const headingColor = isStripe ? "#059669" : "#6366f1"
    
    const bodyContent = isStripe 
      ? `<p>Your credit card payment has been processed successfully!</p>
         <p><strong>Item:</strong> ${itemTitle}</p>
         <p><strong>Amount Paid:</strong> $${amount}</p>
         <h3 style="margin-top: 24px;">Next Steps</h3>
         <p>We'll be in touch with pickup or delivery details for your item.</p>`
      : `<p>Please mail your check to complete payment for your auction item.</p>
         <p><strong>Item:</strong> ${itemTitle}</p>
         <p><strong>Amount Due:</strong> $${amount}</p>
         <h3 style="margin-top: 24px;">Check Details</h3>
         <p><strong>Make check payable to:</strong> San Anselmo Cooperative Nursery School</p>
         <p><strong>Mail to:</strong> 24 Myrtle Lane, San Anselmo, CA 94960</p>
         <p><strong>Memo:</strong> ${itemTitle}</p>
         <p style="color: #dc2626; margin-top: 16px;"><strong>Please mail within 14 days.</strong></p>`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${headingColor};">${heading}</h2>
          ${bodyContent}
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            Thank you for supporting San Anselmo Cooperative Nursery School!
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error)
  }
}
