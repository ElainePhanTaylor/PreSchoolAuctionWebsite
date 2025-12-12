# San Anselmo Cooperative Nursery School - Auction Website

## Project Overview
A fundraising auction website for the San Anselmo Cooperative Nursery School to run their silent auction online.

---

## Core Features

### 1. User Authentication
- **Registration requires:**
  - Email
  - Password
  - Username (display name shown to other bidders)
  - Phone number
- **Login**: Secure login to place bids and track activity
- **Profile**: User's info on file for all communications
- Password reset functionality

### 2. Main Dashboard (Post-Login)
After logging in, users see two main options:

| Option | Description |
|--------|-------------|
| 🛒 **Bid on Items** | Browse auction and place bids |
| 🎁 **Donate an Item** | Submit an item to be auctioned |

### 3. Donate an Item (Item Submission)
Users can contribute items to the auction:
- **Upload multiple photographs** of the item
- **Item title** 
- **Description** of the item
- **Estimated value** (optional)
- **Donor information** (auto-filled from logged-in user)
- Submitted items go to Admin for review/approval before appearing in auction

### 4. Silent Auction (Bidding)
- Browse auction items with photos and descriptions
- **Categories**: Filter by type:
  - Experiences
  - Gift Cards
  - Home & Household
  - Services
  - Handmade
  - Art
  - Food & Dining
  - Sports
  - Kids
  - Other
  - *(Categories with no items are hidden automatically)*
- **Search**: Find items by keyword
- **Watchlist/Favorites**: Save items you're interested in
- **Featured Items**: Highlighted high-value or special items
- Place bids on items
- **Minimum bid increment**: $10 (must bid at least $10 more than current bid)
- **"Buy Now" option**: Skip bidding and purchase immediately at set price (optional per item)
- Track bidding status (winning, outbid, etc.)
- **Single auction end time**: All items end at the same time
- Auction countdown displayed
- **Anti-sniping protection**: Extend bidding by **2 minutes** if bid comes in at last second
- Automatic winner determination when auction closes
- **Live bid feed**: Show recent bids to create excitement

### 5. Notifications & Emails
- **Outbid alerts**: Email users immediately when they're outbid
- **Auction ending reminders**: "24 hours left!" and "1 hour left!" emails
- **Winner notifications**: Automatic email when auction closes with payment link
- **Thank you emails to donors**: Acknowledge people who contributed items
- **Payment confirmation**: Receipt emails for completed payments
- **Check payment reminders**: Follow-up emails for pending check payments

### 6. Payment Processing

#### Option A: Pay with Stripe (Credit/Debit Card)
- Secure online payment via Stripe integration
- Immediate payment confirmation
- Email receipt

#### Option B: Pay by Check
- User selects "Pay by Check" option
- **Automatic email sent to user containing:**
  - Total amount owed
  - **Payable to**: San Anselmo Cooperative Nursery School
  - **Mail/Drop-off address**: 24 Myrtle Lane, San Anselmo, CA 94960
  - **Payment deadline**: 14 days after auction ends
- User marked as "Pending Payment" in the system
- No immediate charge

### 7. Admin Dashboard
- **Item Management:**
  - Review and approve submitted/donated items
  - **Add items directly** (for drop-off donations — upload photos, description, donor info on their behalf)
  - Edit/remove auction items
  - Set starting bid prices
  - Set "Buy Now" prices (optional per item)
  - Mark items as "Featured"
  - Assign categories to items
- View all auction items and bids
- See list of winners after auction closes
- **Payment tracking:**
  - ✅ Paid (via Stripe) 
  - ⏳ Pending (check payments)
- **Reminders/Notifications:**
  - List of users who owe check payments
  - Ability to mark checks as received
  - Send reminder emails to pending payers

### 8. Reporting & Analytics (Admin)
- **Total raised dashboard**: See fundraising progress in real-time
- **Popular items report**: See what got the most bids
- **Donor report**: List of who donated what items
- **Bidder participation**: Who's bidding and how much
- **Export to CSV/Excel**: Download data for records and thank-you letters

### 9. Item Pickup & Logistics
- **Pickup location**: San Anselmo Cooperative Nursery School (24 Myrtle Lane, San Anselmo, CA 94960)
- **Mailing option**: Available for winners who are farther away
- Configurable pickup times (set by admin)
- Include pickup/mailing info in winner emails

### 10. Social Sharing
- Share items on social media (Facebook, etc.)
- "Check out this item!" shareable links

### 11. Mobile-Friendly Design
- Fully responsive design for phones and tablets
- Easy bidding from any device
- Touch-friendly interface

### 12. Terms & Conditions
- Legal terms displayed during registration
- No refunds policy
- Liability disclaimers

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Visitor** | Browse items, view auction (no bidding) |
| **Registered User** | Place bids, donate items, pay for won items |
| **Admin** | Approve donated items, manage auction, track payments, send reminders, add items directly |

### Admin Configuration
- **Multiple admins supported**
- Admin status is granted by adding email addresses to a predefined list
- Admins can add items directly on behalf of donors (for drop-off donations where the donor doesn't want to upload themselves)
- **Initial Admin Emails:**
  - elainph@gmail.com
  - Taylor.andreas.elaine@Gmail.com

---

## Design & Branding

### Color Palette
| Color | Hex | Use |
|-------|-----|-----|
| **Primary Green** | `#5B8C5A` | Headers, primary buttons, accents |
| **Warm Cream** | `#F5F0E8` | Page backgrounds |
| **Accent Gold** | `#D4A853` | CTAs, highlights, bid buttons |
| **Dark Text** | `#2C3E2D` | Body text |
| **White** | `#FFFFFF` | Cards, clean sections |

### Design Vibe
- Warm & welcoming (not corporate)
- Natural tones reflecting school's outdoor/nature focus
- Community-focused, friendly, approachable
- Clean, modern, mobile-friendly
- **Pacific Redwood imagery** — subtle background elements or hero images featuring redwood trees

### Typography
- Friendly, readable fonts (Nunito, Quicksand, or similar)
- Clear hierarchy for auction items and bids

---

## Tech Stack
- **Frontend**: Next.js / React
- **Backend**: Next.js API routes
- **Authentication**: NextAuth.js (email + password)
- **Payments**: Stripe
- **Email Service**: Resend (or SendGrid)
- **Database**: PostgreSQL (on Railway)
- **File Storage**: Cloudinary or Railway volume (for uploaded item photos)
- **Hosting**: Railway
- **Code Repository**: GitHub

---

## Configuration Summary

| Setting | Value |
|---------|-------|
| **Auction end time** | Single end time for all items |
| **Timezone** | PST (Pacific Standard Time) |
| **Anti-sniping extension** | 2 minutes |
| **Minimum bid increment** | $10 |
| **Starting bid** | Set by admin when approving items |
| **Check payable to** | San Anselmo Cooperative Nursery School |
| **Check mail/drop-off** | 24 Myrtle Lane, San Anselmo, CA 94960 |
| **Check payment deadline** | 14 days after auction ends |
| **Item pickup** | At school, or mailing for those farther away |
| **Categories** | Experiences, Gift Cards, Home & Household, Services, Handmade, Art, Food & Dining, Sports, Kids, Other |
| **Registration fields** | Email, password, username (display name), phone |
| **Initial admins** | elainph@gmail.com, Taylor.andreas.elaine@Gmail.com |

*All questions answered — scope complete!* ✅

---

## Setup Checklist

- [ ] Create Stripe account for payment processing
- [ ] Create GitHub repository for code
- [ ] Deploy to Railway
- [ ] Set up email service (Resend)
- [ ] Get logo from school
- [ ] Configure admin emails in environment variables

---

## Contact
**San Anselmo Cooperative Nursery School**  
24 Myrtle Lane, San Anselmo, CA 94960  
Phone: (415) 454-5308  
Website: [sananselmocoop.org](https://www.sananselmocoop.org/)

