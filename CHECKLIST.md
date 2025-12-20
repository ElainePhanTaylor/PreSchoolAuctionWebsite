# Auction Site Checklist

---

## 🧪 Pre-Launch Testing

### Authentication
- [ ] Register new account
- [ ] Login with existing account
- [ ] Logout works
- [ ] Session persists on refresh
- [ ] Non-admin cannot access /admin
- [ ] Admin can access /admin

### Browsing Items
- [ ] Homepage loads items from database
- [ ] Auction page shows all approved items
- [ ] Item detail page loads correctly
- [ ] Images display properly
- [ ] Bid count is accurate

### Bidding (as logged-in user)
- [ ] Can place valid bid
- [ ] Cannot bid below minimum
- [ ] Cannot bid $0 or negative
- [ ] Cannot outbid yourself (shows message)
- [ ] Bid updates item's current bid
- [ ] Bid appears in bid history

### Bidding (edge cases)
- [ ] Cannot bid when logged out (redirects to login)
- [ ] Cannot bid on non-existent item
- [ ] Cannot bid after auction ends

### Admin - Items
- [ ] Can view all items in dashboard
- [ ] Can add new item with all fields
- [ ] Can add item with photo URLs
- [ ] Starting bid auto-calculates to nearest $5
- [ ] Can delete item (including one with bids)
- [ ] Deleted item no longer shows on auction page

### Admin - Auction Settings
- [ ] Can set auction end time
- [ ] Can set minimum bid increment
- [ ] Can set anti-sniping minutes

### Payments
- [ ] Winner sees "Pay Now" button
- [ ] Stripe checkout loads correct amount
- [ ] Successful payment recorded
- [ ] Failed payment handled gracefully
- [ ] Cannot pay for item you didn't win
- [ ] Check payment option available

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

- [ ] Bid confirmation popup: "Are you sure you want to bid $X on 'Item Name'?"
- [ ] Max characters for item description (with counter)
- [ ] Phone number formatting with dashes (auto-format as user types)
- [ ] Password reset functionality
- [ ] Verify Resend domain for better email delivery
- [ ] Admin payments table: show all won items, winner full names, payment status, "Mark Check Received" button

---

## 📅 Deferred to Future Years

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
- [x] User-submitted donations (`/donate` page)
- [x] User dashboard shows bids and won items
- [x] Navigation consistency (logo → dashboard when logged in)

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
