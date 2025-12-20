"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Trees, Package, CreditCard, 
  Settings, AlertCircle, Eye, Trash2,
  Plus, Loader2, CheckCircle, Clock, DollarSign, Mail, Phone
} from "lucide-react"

interface AuctionItem {
  id: string
  title: string
  category: string
  currentBid: number | null
  startingBid: number
  isFeatured: boolean
  status: string
  _count: { bids: number }
  photos: { url: string }[]
}

interface PaymentItem {
  itemId: string
  itemTitle: string
  itemPhoto: string | null
  winningBid: number
  winner: {
    id: string
    name: string
    displayName: string
    email: string
    phone: string | null
  } | null
  payment: {
    id: string
    status: "PENDING" | "COMPLETED"
    method: "STRIPE" | "CHECK" | null
    amount: number
    updatedAt: string
  } | null
}

interface PaymentStats {
  totalSold: number
  totalPaid: number
  totalPending: number
  totalRevenue: number
  expectedRevenue: number
}

type Tab = "overview" | "items" | "payments" | "settings"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("items")
  const [items, setItems] = useState<AuctionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [endingAuction, setEndingAuction] = useState(false)
  
  // Payment tracking state
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null)

  // Fetch items
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/items?status=APPROVED")
        if (res.ok) {
          const data = await res.json()
          setItems(data)
        }
      } catch (error) {
        console.error("Failed to fetch items:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  // Fetch payments when payments tab is active
  useEffect(() => {
    if (activeTab !== "payments") return
    
    async function fetchPayments() {
      setPaymentsLoading(true)
      try {
        const res = await fetch("/api/admin/payments")
        if (res.ok) {
          const data = await res.json()
          setPayments(data.payments)
          setPaymentStats(data.stats)
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error)
      } finally {
        setPaymentsLoading(false)
      }
    }
    fetchPayments()
  }, [activeTab])

  // Mark check payment as received
  const handleMarkPayment = async (itemId: string, action: "mark_received" | "mark_pending") => {
    setUpdatingPayment(itemId)
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, action }),
      })
      
      if (res.ok) {
        // Refresh payments
        const refreshRes = await fetch("/api/admin/payments")
        if (refreshRes.ok) {
          const data = await refreshRes.json()
          setPayments(data.payments)
          setPaymentStats(data.stats)
        }
      } else {
        const data = await res.json()
        alert(data.error || "Failed to update payment")
      }
    } catch {
      alert("Failed to update payment")
    } finally {
      setUpdatingPayment(null)
    }
  }

  // Delete item handler
  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" })
      if (res.ok) {
        setItems(items.filter(item => item.id !== itemId))
      } else {
        alert("Failed to delete item")
      }
    } catch {
      alert("Failed to delete item")
    }
  }

  // End auction handler
  const handleEndAuction = async () => {
    const confirmed = confirm(
      "⚠️ END AUCTION?\n\n" +
      "This will:\n" +
      "• Set winners for all items with bids\n" +
      "• Mark items without bids as unsold\n" +
      "• Send winner notification emails\n\n" +
      "This action cannot be undone. Continue?"
    )
    if (!confirmed) return

    setEndingAuction(true)
    try {
      const res = await fetch("/api/admin/end-auction", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        alert(`✅ ${data.message}`)
        // Refresh items
        const itemsRes = await fetch("/api/items?status=APPROVED")
        if (itemsRes.ok) {
          setItems(await itemsRes.json())
        }
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch {
      alert("Failed to end auction")
    } finally {
      setEndingAuction(false)
    }
  }

  // Calculate stats from real data
  const stats = {
    totalItems: items.length,
    totalBids: items.reduce((sum, item) => sum + item._count.bids, 0),
    totalValue: items.reduce((sum, item) => sum + (item.currentBid ?? item.startingBid), 0),
  }

  // Check authentication and admin status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Trees className="w-12 h-12 text-primary animate-pulse" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const isAdmin = (session?.user as any)?.isAdmin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text mb-2">Access Denied</h1>
          <p className="text-text-muted mb-4">You don&apos;t have permission to access the admin dashboard.</p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "items", label: "Items", icon: Package },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Trees className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-text">SACNS Auction</span>
            </Link>
            <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
              Admin
            </span>
          </div>
          <Link href="/dashboard" className="text-text-muted hover:text-primary transition-colors">
            Exit Admin
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="card p-2 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-text-muted hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === "items" && items.length > 0 && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-white/20" : "bg-violet/20 text-violet"
                    }`}>
                      {items.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "items" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text">Manage Items</h1>
                  <Link href="/admin/items/new" className="btn-gold flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="card p-4">
                    <p className="text-sm text-text-muted">Total Items</p>
                    <p className="text-2xl font-bold text-text">{stats.totalItems}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-text-muted">Total Bids</p>
                    <p className="text-2xl font-bold text-text">{stats.totalBids}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-text-muted">Current Value</p>
                    <p className="text-2xl font-bold text-green-600">${stats.totalValue}</p>
                  </div>
                </div>

                {/* Items Table */}
                {loading ? (
                  <div className="card p-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-violet" />
                    <span className="ml-2 text-text-muted">Loading items...</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="card p-8 text-center text-text-muted">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No items yet</p>
                    <p className="text-sm">Click &quot;Add Item&quot; to create your first auction item</p>
                  </div>
                ) : (
                  <div className="card overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Item</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Category</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Current Bid</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Bids</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {item.photos[0]?.url && (
                                  <img 
                                    src={item.photos[0].url} 
                                    alt="" 
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-text">{item.title}</p>
                                  {item.isFeatured && (
                                    <span className="text-xs text-gold-dark font-medium">Featured</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-text-muted">{item.category.replace("_", " ")}</td>
                            <td className="p-4 font-semibold text-text">
                              ${item.currentBid ?? item.startingBid}
                            </td>
                            <td className="p-4 text-text-muted">{item._count.bids}</td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <Link 
                                  href={`/auction/${item.id}`}
                                  className="p-2 text-text-muted hover:bg-gray-100 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-text">Payment Tracking</h1>

                {/* Stats */}
                {paymentStats && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="card p-4">
                      <p className="text-sm text-text-muted">Items Sold</p>
                      <p className="text-2xl font-bold text-text">{paymentStats.totalSold}</p>
                    </div>
                    <div className="card p-4">
                      <p className="text-sm text-text-muted">Paid</p>
                      <p className="text-2xl font-bold text-green-600">{paymentStats.totalPaid}</p>
                    </div>
                    <div className="card p-4">
                      <p className="text-sm text-text-muted">Pending</p>
                      <p className="text-2xl font-bold text-amber-600">{paymentStats.totalPending}</p>
                    </div>
                    <div className="card p-4">
                      <p className="text-sm text-text-muted">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${paymentStats.totalRevenue}
                        <span className="text-sm font-normal text-text-muted"> / ${paymentStats.expectedRevenue}</span>
                      </p>
                    </div>
                  </div>
                )}

                {paymentsLoading ? (
                  <div className="card p-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-violet" />
                    <span className="ml-2 text-text-muted">Loading payments...</span>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="card p-8 text-center text-text-muted">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No sold items yet</p>
                    <p className="text-sm mt-2">
                      After ending the auction, sold items and payment status will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="card overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Item</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Winner</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Contact</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Amount</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.map((payment) => (
                          <tr key={payment.itemId} className="hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {payment.itemPhoto && (
                                  <img 
                                    src={payment.itemPhoto} 
                                    alt="" 
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <span className="font-medium text-text">{payment.itemTitle}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              {payment.winner ? (
                                <div>
                                  <p className="font-medium text-text">{payment.winner.name}</p>
                                  <p className="text-xs text-text-muted">@{payment.winner.displayName}</p>
                                </div>
                              ) : (
                                <span className="text-text-muted">—</span>
                              )}
                            </td>
                            <td className="p-4">
                              {payment.winner ? (
                                <div className="space-y-1">
                                  <a 
                                    href={`mailto:${payment.winner.email}`}
                                    className="flex items-center gap-1 text-sm text-violet hover:underline"
                                  >
                                    <Mail className="w-3 h-3" />
                                    {payment.winner.email}
                                  </a>
                                  {payment.winner.phone && (
                                    <a 
                                      href={`tel:${payment.winner.phone}`}
                                      className="flex items-center gap-1 text-sm text-text-muted hover:text-violet"
                                    >
                                      <Phone className="w-3 h-3" />
                                      {payment.winner.phone}
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-text-muted">—</span>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-text">
                              ${payment.winningBid}
                            </td>
                            <td className="p-4">
                              {payment.payment?.status === "COMPLETED" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  {payment.payment.method === "STRIPE" ? "Paid (Card)" : "Paid (Check)"}
                                </span>
                              ) : payment.payment?.status === "PENDING" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  <Clock className="w-3 h-3" />
                                  {payment.payment.method === "CHECK" ? "Check Pending" : "Pending"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                  <DollarSign className="w-3 h-3" />
                                  Not Started
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {payment.payment?.status === "COMPLETED" ? (
                                <button
                                  onClick={() => handleMarkPayment(payment.itemId, "mark_pending")}
                                  disabled={updatingPayment === payment.itemId}
                                  className="text-xs text-text-muted hover:text-red-600 disabled:opacity-50"
                                >
                                  {updatingPayment === payment.itemId ? "..." : "Undo"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleMarkPayment(payment.itemId, "mark_received")}
                                  disabled={updatingPayment === payment.itemId}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                  {updatingPayment === payment.itemId ? "..." : "Mark Received"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}


            {activeTab === "settings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-text">Auction Settings</h1>

                {/* End Auction Section */}
                <div className="card p-6 border-2 border-red-200 bg-red-50">
                  <h2 className="text-lg font-bold text-red-700 mb-2">End Auction</h2>
                  <p className="text-sm text-red-600 mb-4">
                    When you&apos;re ready to close the auction, click below. This will set winners 
                    for all items and send notification emails.
                  </p>
                  <button
                    onClick={handleEndAuction}
                    disabled={endingAuction}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {endingAuction ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Ending Auction...
                      </>
                    ) : (
                      "End Auction & Notify Winners"
                    )}
                  </button>
                </div>
                
                <div className="card p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Auction End Date & Time
                    </label>
                    <input type="datetime-local" className="input max-w-xs" />
                    <p className="text-xs text-text-muted mt-1">All items end at the same time (PST)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Anti-Sniping Extension (minutes)
                    </label>
                    <input type="number" className="input max-w-xs" defaultValue={2} min={1} max={10} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Minimum Bid Increment ($)
                    </label>
                    <input type="number" className="input max-w-xs" defaultValue={10} min={1} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Check Payment Deadline (days after auction)
                    </label>
                    <input type="number" className="input max-w-xs" defaultValue={14} min={1} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Pickup Location
                    </label>
                    <textarea 
                      className="input resize-none" 
                      rows={3}
                      defaultValue="San Anselmo Cooperative Nursery School
24 Myrtle Lane, San Anselmo, CA 94960"
                    />
                  </div>

                  <button className="btn-primary">Save Settings</button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

