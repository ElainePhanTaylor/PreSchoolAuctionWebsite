# SACNS Auction Website - Project Scope

## Project Overview
Silent auction fundraiser website for San Anselmo Cooperative Nursery School.

---

## Current Status

### ✅ Completed
- [x] Frontend UI with modern design
- [x] Home page with hero, stats, trending items
- [x] Auction listing page with grid/list views
- [x] Item detail page with photo gallery
- [x] Donate item page (form UI)
- [x] Login/Register pages
- [x] Admin dashboard (UI only)
- [x] Responsive design
- [x] Accessibility improvements (larger fonts, darker text for seniors)
- [x] Client-side image compression (browser-image-compression)
- [x] Railway deployment (frontend live)
- [x] GitHub repository connected

### 🔄 In Progress
- [ ] Database setup (PostgreSQL on Railway)
- [ ] Authentication (NextAuth.js configured, needs DB)

### 📋 To Do
- [ ] Connect PostgreSQL database
- [ ] Run database migrations
- [ ] Test user registration/login
- [ ] Image upload to Supabase Storage
- [ ] Generate 1200px + 400px thumbnail versions
- [ ] Admin approval workflow for donated items
- [ ] Email notifications (Resend)
- [ ] Bidding functionality
- [ ] Payment processing (Stripe)

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS 3 |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Railway) |
| ORM | Prisma 5 |
| Auth | NextAuth.js |
| Image Storage | Supabase Storage (planned) |
| Email | Resend (planned) |
| Payments | Stripe (planned) |
| Hosting | Railway |

---

## Image Handling Spec

### Upload Flow
1. User selects image(s)
2. Client-side compression (already built)
3. Resize to two versions:
   - **Full**: 1200px wide, ~300KB
   - **Thumbnail**: 400px wide, ~30KB
4. Upload both to Supabase Storage
5. Store URLs in database

### Constraints
- Max 5 photos per item
- Max file size before compression: 10MB
- Supported formats: JPG, PNG, WebP
- Delete originals after resize (don't store)

### Storage Estimate
- ~200 items × 2 sizes × ~165KB avg = **~66MB total**
- Well within Supabase free tier (1GB)

---

## User Roles

### Public (Not Logged In)
- View auction items
- Browse by category
- View item details

### Registered User
- All public features
- Place bids
- Watchlist items
- Donate items (pending admin approval)
- View bid history

### Admin
- All user features
- Approve/reject donated items
- View all bids
- Manage auction settings
- Access admin dashboard

### Admin Emails
- elainph@gmail.com
- taylor.andreas.elaine@gmail.com

---

## Database Schema (Prisma)

### Models
- **User** - Accounts with email, password, admin flag
- **Item** - Auction items with title, description, category, status
- **Photo** - Item photos with URL and order
- **Bid** - User bids on items
- **Watchlist** - User saved items
- **Payment** - Payment records
- **AuctionSettings** - Global auction configuration

### Item Status Flow
```
PENDING → APPROVED → LIVE → SOLD
              ↓
          REJECTED
```

---

## Environment Variables Required

| Variable | Purpose | Status |
|----------|---------|--------|
| `DATABASE_URL` | PostgreSQL connection | ❌ Need to add |
| `NEXTAUTH_SECRET` | Session encryption | ❌ Need to add |
| `NEXTAUTH_URL` | App URL for auth | ❌ Need to add |
| `RESEND_API_KEY` | Email sending | ❌ Need to add |
| `SUPABASE_URL` | Storage endpoint | ❌ Not set up |
| `SUPABASE_ANON_KEY` | Storage auth | ❌ Not set up |
| `STRIPE_SECRET_KEY` | Payments | ❌ Not set up |

---

## Next Steps (Priority Order)

1. **Database Connection**
   - Add PostgreSQL in Railway
   - Copy DATABASE_URL to app variables
   - Add NEXTAUTH_SECRET and NEXTAUTH_URL
   - Run `prisma migrate deploy`

2. **Test Authentication**
   - Register a test user
   - Login flow
   - Verify admin detection

3. **Image Upload (Supabase)**
   - Set up Supabase Storage bucket
   - Implement dual-size generation (1200px + 400px)
   - Wire up donate form to upload

4. **Complete Donation Flow**
   - Save items to database
   - Email admin on new submission
   - Admin approval UI

5. **Bidding System**
   - Place bid functionality
   - Bid validation
   - Outbid notifications

6. **Payments (Stripe)**
   - Winner payment flow
   - Receipt emails

---

## File Naming Conventions

### Images
- ✅ `wine-country.jpg`
- ✅ `kids-art-camp.png`
- ✅ `spa-day-2024.jpeg`
- ❌ `Wine Country.JPG` (spaces, uppercase)
- ❌ `IMG_1234.jpeg` (not descriptive)

---

## Notes
- Target audience includes seniors - prioritize readability
- Expect ~100-200 auction items max
- Both admins and donors can upload items
- Donors' items require admin approval before going live

---

*Last Updated: December 2024*
