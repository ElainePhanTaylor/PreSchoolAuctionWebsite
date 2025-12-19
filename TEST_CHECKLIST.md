# Auction Site Test Checklist

## Pre-Launch Testing

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

### Payments (after Stripe setup)
- [ ] Winner sees "Pay Now" button
- [ ] Stripe checkout loads correct amount
- [ ] Successful payment recorded
- [ ] Failed payment handled gracefully
- [ ] Cannot pay for item you didn't win
- [ ] Check payment option available

### Emails (after Resend setup)
- [ ] Outbid notification sent
- [ ] Winner notification sent
- [ ] Payment confirmation sent

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | (your admin email) | ******** |
| User 1 | test1@example.com | ******** |
| User 2 | test2@example.com | ******** |

---

## Notes
_Add any bugs or issues found during testing:_

- 
- 
- 
