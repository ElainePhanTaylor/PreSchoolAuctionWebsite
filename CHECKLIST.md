# Auction Site Checklist

---

## 🧪 Pre-Launch Testing

### Authentication ✅
- [x] Register new account
- [x] Login with existing account
- [x] Logout works
- [x] Session persists on refresh
- [x] Non-admin cannot access /admin
- [x] Admin can access /admin

### Browsing Items ✅
- [x] Homepage loads items from database
- [x] Auction page shows all approved items
- [x] Item detail page loads correctly
- [x] Images display properly
- [x] Bid count is accurate

### Bidding (as logged-in user) ✅
- [x] Can place valid bid
- [x] Cannot bid below minimum
- [x] Cannot bid $0 or negative
- [x] Cannot outbid yourself (shows message)
- [x] Bid updates item's current bid
- [x] Bid appears in bid history

### Bidding (edge cases) ✅
- [x] Cannot bid when logged out (redirects to login)
- [x] Cannot bid on non-existent item
- [x] Cannot bid after auction ends

### Admin - Items ✅
- [x] Can view all items in dashboard
- [x] Can add new item with all fields
- [x] Can add item with photo URLs
- [x] Starting bid auto-calculates to nearest $5
- [x] Can delete item (including one with bids)
- [x] Deleted item no longer shows on auction page

### Admin - Auction Settings ✅
- [x] Can set auction end time
- [x] Can set minimum bid increment
- [x] Can set anti-sniping minutes

### Payments ✅
- [x] Winner sees "Pay Now" button
- [x] Stripe checkout loads correct amount
- [x] Successful payment recorded
- [x] Failed payment handled gracefully
- [x] Cannot pay for item you didn't win
- [x] Check payment option available

### Emails
- [ ] Outbid notification sent
- [ ] Winner notification sent
- [ ] Payment confirmation sent

---

## 🐛 Bugs to Fix

- [x] ~~Dashboard logo click logs user out~~ → Fixed: goes to dashboard
- [x] ~~Homepage doesn't show logged-in state~~ → Fixed: shows "My Dashboard" button
- [x] ~~User dashboard doesn't show their bids~~ → Fixed
- [x] ~~User dashboard doesn't show items won with payment links~~ → Fixed

---

## ✨ Features to Add (Year 1)

- [x] ~~Bid confirmation popup~~ → Done
- [x] ~~Admin payments table~~ → Done
- [ ] Remove up/down spinner arrows on Estimated Value and Starting Bid fields
- [ ] Max characters for item description (with counter)
- [ ] Phone number formatting with dashes (auto-format as user types)
- [ ] Password reset functionality
- [ ] Verify Resend domain for better email delivery

---

## 📅 Deferred to Future Years

- [ ] User-submitted donations (`/donate` page) - currently admin-only
- [ ] SMS notifications
- [ ] Watchlist feature
- [ ] "Buy Now" option
- [ ] Social sharing

---

## ✅ Completed

- [x] Stripe Checkout integration
- [x] Check payment option
- [x] Email notifications (Resend)
- [x] End Auction & Notify Winners
- [x] Prevent bidding against yourself
- [x] Anti-sniping logic
- [x] First/Last name on registration
- [x] Phone number required
- [x] Unique display names
- [x] Cloudinary image upload (auto-resize & optimize)
- [x] User dashboard shows bids and won items
- [x] Navigation consistency (logo → dashboard when logged in)
- [x] Bid confirmation popup
- [x] Admin payments table with "Mark Check Received"
- [x] Whole dollar prices only (no decimals)

---

## 📝 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | elainph@gmail.com | ******** |
| User 1 | (your test email) | ******** |

---

## 🗒️ Notes
_Add any bugs or issues found during testing:_

- 
- 
- 
