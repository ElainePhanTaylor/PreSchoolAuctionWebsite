# San Anselmo Cooperative Nursery School Auction

A modern online auction platform for the San Anselmo Cooperative Nursery School annual fundraiser.

## Features

- 🎯 **Browse & Bid** - View auction items and place bids
- 🔐 **User Authentication** - Register, login, and manage your account
- 💳 **Payment Processing** - Pay with credit card (Stripe) or check
- 📧 **Email Notifications** - Outbid alerts, winner notifications, payment confirmations
- 🛡️ **Anti-Sniping** - Auction extends if bids come in at the last moment
- 👑 **Admin Dashboard** - Manage items, end auction, track payments
- 🎁 **Donation Portal** - Community members can submit items to donate

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## 🔌 External Services

This application depends on the following external services:

### Database

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **PostgreSQL** | Primary database for users, items, bids, payments | Hosted on [Railway](https://railway.app) |

### Payments

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **Stripe** | Credit/debit card payment processing | [dashboard.stripe.com](https://dashboard.stripe.com) |

Stripe is used for:
- Checkout sessions for auction item payments
- Webhook handling for payment confirmations

### Email

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **Resend** | Transactional email delivery | [resend.com](https://resend.com) |

Emails sent:
- Outbid notifications
- Winner announcements
- Payment confirmations
- Check payment instructions

### Image Storage

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **Cloudinary** | Image upload, storage, and optimization | [console.cloudinary.com](https://console.cloudinary.com) |

Cloudinary handles:
- Auction item photo uploads
- Automatic image resizing and optimization
- CDN delivery for fast loading

### Hosting

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **Railway** | Application hosting and PostgreSQL database | [railway.app](https://railway.app) |

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Resend (Email)
RESEND_API_KEY="re_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 👤 Admin Access

Admin privileges are granted based on email address. The following emails have admin access:

- `elainph@gmail.com`
- `taylor.andreas.elaine@gmail.com`
- `shabnazy@gmail.com`

To add more admins, edit `src/lib/auth.ts` and add emails to the `ADMIN_EMAILS` array.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   ├── auction/            # Auction browsing & item details
│   ├── dashboard/          # User dashboard
│   ├── donate/             # Item donation form
│   ├── login/              # Login page
│   ├── payment/            # Payment success page
│   └── register/           # Registration page
├── components/             # Reusable React components
├── lib/                    # Utilities (auth, prisma, stripe, email, cloudinary)
└── types/                  # TypeScript type definitions

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Database migrations
```

---

## 🚀 Deployment

The site is deployed on Railway. To deploy updates:

1. Push to the `main` branch
2. Railway auto-deploys from GitHub

---

## 📝 License

Private - San Anselmo Cooperative Nursery School
