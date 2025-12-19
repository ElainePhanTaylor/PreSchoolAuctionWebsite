"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Trees, LayoutDashboard, Package, Users, CreditCard, 
  Settings, Clock, CheckCircle, XCircle, Eye, Edit,
  DollarSign, TrendingUp, AlertCircle, Download, Mail,
  ChevronRight, Plus
} from "lucide-react"

// Demo data
const STATS = {
  totalRaised: 12450,
  totalItems: 45,
  activeBidders: 78,
  pendingApprovals: 5,
  pendingPayments: 8,
}

const PENDING_ITEMS = [
  { id: "1", title: "Homemade Cookies - Monthly for a Year", donor: "Sarah Miller", category: "FOOD_DINING", submitted: "2 hours ago" },
  { id: "2", title: "Piano Lessons - 4 Sessions", donor: "James Chen", category: "SERVICES", submitted: "5 hours ago" },
  { id: "3", title: "Handmade Jewelry Set", donor: "Maria Garcia", category: "HANDMADE", submitted: "1 day ago" },
]

const PENDING_PAYMENTS = [
  { id: "1", user: "John Smith", email: "john@email.com", item: "Wine Country Getaway", amount: 450, method: "CHECK", daysOverdue: 0 },
  { id: "2", user: "Lisa Wong", email: "lisa@email.com", item: "Spa Day Package", amount: 280, method: "CHECK", daysOverdue: 3 },
  { id: "3", user: "Mike Johnson", email: "mike@email.com", item: "Golf Lessons", amount: 150, method: "CHECK", daysOverdue: 7 },
]

type Tab = "overview" | "items" | "payments" | "users" | "settings"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("overview")

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
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "items", label: "Items", icon: Package },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "users", label: "Users", icon: Users },
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
                  {tab.id === "items" && STATS.pendingApprovals > 0 && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-white/20" : "bg-gold text-white"
                    }`}>
                      {STATS.pendingApprovals}
                    </span>
                  )}
                  {tab.id === "payments" && STATS.pendingPayments > 0 && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-white/20" : "bg-gold text-white"
                    }`}>
                      {STATS.pendingPayments}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-text">Dashboard Overview</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Total Raised</p>
                        <p className="text-2xl font-bold text-text">${STATS.totalRaised.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Total Items</p>
                        <p className="text-2xl font-bold text-text">{STATS.totalItems}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Active Bidders</p>
                        <p className="text-2xl font-bold text-text">{STATS.activeBidders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gold-dark" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Pending</p>
                        <p className="text-2xl font-bold text-text">{STATS.pendingApprovals + STATS.pendingPayments}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Pending Approvals */}
                  <div className="card">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h2 className="font-semibold text-text">Pending Approvals</h2>
                      <button 
                        onClick={() => setActiveTab("items")}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="divide-y">
                      {PENDING_ITEMS.slice(0, 3).map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <p className="font-medium text-text">{item.title}</p>
                            <p className="text-sm text-text-muted">by {item.donor} • {item.submitted}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Payments */}
                  <div className="card">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h2 className="font-semibold text-text">Pending Check Payments</h2>
                      <button 
                        onClick={() => setActiveTab("payments")}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="divide-y">
                      {PENDING_PAYMENTS.slice(0, 3).map((payment) => (
                        <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <p className="font-medium text-text">{payment.user}</p>
                            <p className="text-sm text-text-muted">{payment.item} • ${payment.amount}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {payment.daysOverdue > 0 && (
                              <span className="text-xs text-red-500 font-medium">
                                {payment.daysOverdue}d overdue
                              </span>
                            )}
                            <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <Mail className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Export */}
                <div className="card p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text">Export Data</h3>
                    <p className="text-sm text-text-muted">Download reports for your records</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Bids
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Donors
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "items" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text">Manage Items</h1>
                  <Link href="/admin/items/new" className="btn-gold flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Link>
                </div>

                {/* Pending Approvals */}
                {PENDING_ITEMS.length > 0 && (
                  <div className="card">
                    <div className="p-4 border-b bg-gold/10">
                      <h2 className="font-semibold text-text flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gold-dark" />
                        Pending Approval ({PENDING_ITEMS.length})
                      </h2>
                    </div>
                    <div className="divide-y">
                      {PENDING_ITEMS.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium text-text">{item.title}</p>
                            <p className="text-sm text-text-muted">
                              Donated by {item.donor} • {item.category.replace("_", " ")} • Submitted {item.submitted}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-text-muted hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card p-8 text-center text-text-muted">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Item management table will appear here</p>
                  <p className="text-sm">Connect to database to see all items</p>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-text">Payment Tracking</h1>

                {/* Payment Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="card p-4 border-l-4 border-green-500">
                    <p className="text-sm text-text-muted">Paid (Stripe)</p>
                    <p className="text-2xl font-bold text-green-600">$8,200</p>
                  </div>
                  <div className="card p-4 border-l-4 border-gold">
                    <p className="text-sm text-text-muted">Pending (Check)</p>
                    <p className="text-2xl font-bold text-gold-dark">$4,250</p>
                  </div>
                  <div className="card p-4 border-l-4 border-red-500">
                    <p className="text-sm text-text-muted">Overdue</p>
                    <p className="text-2xl font-bold text-red-500">$880</p>
                  </div>
                </div>

                {/* Pending Payments Table */}
                <div className="card">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold text-text">Pending Check Payments</h2>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-text-muted">Winner</th>
                        <th className="text-left p-4 text-sm font-medium text-text-muted">Item</th>
                        <th className="text-left p-4 text-sm font-medium text-text-muted">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-text-muted">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-text-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {PENDING_PAYMENTS.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <p className="font-medium text-text">{payment.user}</p>
                            <p className="text-sm text-text-muted">{payment.email}</p>
                          </td>
                          <td className="p-4 text-text">{payment.item}</td>
                          <td className="p-4 font-semibold text-text">${payment.amount}</td>
                          <td className="p-4">
                            {payment.daysOverdue > 0 ? (
                              <span className="inline-flex items-center gap-1 text-red-500 text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                {payment.daysOverdue} days overdue
                              </span>
                            ) : (
                              <span className="text-gold-dark text-sm font-medium">Pending</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Send reminder">
                                <Mail className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark as paid">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-text">User Management</h1>
                <div className="card p-8 text-center text-text-muted">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>User management will appear here</p>
                  <p className="text-sm">Connect to database to see all users</p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-text">Auction Settings</h1>
                
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

