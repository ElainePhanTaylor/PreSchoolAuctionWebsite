import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Admin emails to notify about new donations
const ADMIN_EMAILS = [
  "elainph@gmail.com",
  "taylor.andreas.elaine@gmail.com",
]

export async function sendNewDonationNotification({
  itemTitle,
  donorName,
  donorEmail,
  category,
  estimatedValue,
}: {
  itemTitle: string
  donorName: string
  donorEmail: string
  category: string
  estimatedValue?: number
}) {
  try {
    await resend.emails.send({
      from: 'SACNS Auction <noreply@yourdomain.com>',
      to: ADMIN_EMAILS,
      subject: `🎁 New Donation Submission: ${itemTitle}`,
      html: `
        <h2>New Item Donation Submitted!</h2>
        <p>A new item has been submitted for the auction and needs your approval.</p>
        
        <h3>Item Details:</h3>
        <ul>
          <li><strong>Title:</strong> ${itemTitle}</li>
          <li><strong>Category:</strong> ${category}</li>
          <li><strong>Estimated Value:</strong> ${estimatedValue ? `$${estimatedValue}` : 'Not specified'}</li>
        </ul>
        
        <h3>Donor Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${donorName}</li>
          <li><strong>Email:</strong> ${donorEmail}</li>
        </ul>
        
        <p><a href="${process.env.NEXTAUTH_URL}/admin">Click here to review and approve</a></p>
        
        <p style="color: #666; font-size: 12px;">
          San Anselmo Cooperative Nursery School Auction
        </p>
      `,
    })
    console.log('Admin notification email sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send admin notification email:', error)
    return false
  }
}

export async function sendDonationConfirmation({
  donorEmail,
  donorName,
  itemTitle,
}: {
  donorEmail: string
  donorName: string
  itemTitle: string
}) {
  try {
    await resend.emails.send({
      from: 'SACNS Auction <noreply@yourdomain.com>',
      to: donorEmail,
      subject: `Thank you for your donation: ${itemTitle}`,
      html: `
        <h2>Thank You, ${donorName}!</h2>
        <p>We've received your donation submission for the San Anselmo Cooperative Nursery School Auction.</p>
        
        <h3>Item Submitted:</h3>
        <p><strong>${itemTitle}</strong></p>
        
        <p>Our team will review your submission and you'll receive another email once it's been approved.</p>
        
        <p>Thank you for supporting our school community!</p>
        
        <p style="color: #666; font-size: 12px;">
          San Anselmo Cooperative Nursery School<br>
          24 Myrtle Lane, San Anselmo, CA 94960
        </p>
      `,
    })
    console.log('Donor confirmation email sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send donor confirmation email:', error)
    return false
  }
}

