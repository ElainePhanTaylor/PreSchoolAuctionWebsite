import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "SACNS Auction <auction@sacns.org>"
const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

// Send outbid notification
export async function sendOutbidEmail(
  toEmail: string,
  itemTitle: string,
  newBidAmount: number,
  itemId: string
) {
  try {
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
    console.log(`Outbid email sent to ${toEmail}`)
  } catch (error) {
    console.error("Failed to send outbid email:", error)
  }
}

// Send winner notification
export async function sendWinnerEmail(
  toEmail: string,
  itemTitle: string,
  winningBid: number,
  itemId: string
) {
  try {
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
    console.log(`Winner email sent to ${toEmail}`)
  } catch (error) {
    console.error("Failed to send winner email:", error)
  }
}

// Send payment confirmation
export async function sendPaymentConfirmationEmail(
  toEmail: string,
  itemTitle: string,
  amount: number,
  paymentMethod: "STRIPE" | "CHECK"
) {
  try {
    const methodText = paymentMethod === "STRIPE" 
      ? "Your credit card payment has been processed." 
      : "We've received your check payment request. Please mail your check as instructed."

    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Payment confirmed for "${itemTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Payment Confirmed</h2>
          <p>Thank you for your payment!</p>
          <p><strong>Item:</strong> ${itemTitle}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p>${methodText}</p>
          <h3 style="margin-top: 24px;">Next Steps</h3>
          <p>We'll be in touch with pickup or delivery details for your item.</p>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            Thank you for supporting San Anselmo Cooperative Nursery School!
          </p>
        </div>
      `,
    })
    console.log(`Payment confirmation email sent to ${toEmail}`)
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error)
  }
}
