"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Gavel, Settings, LogOut, User, 
  TrendingUp, Package, ArrowRight, AlertCircle,
  CheckCircle, CreditCard, Clock, Loader2, Gift
} from "lucide-react"

interface BidItem {
  id: string
  amount: number
  createdAt: string
  itemId: string
  itemTitle: string
  itemPhoto: string | null
  currentBid: number
  status: "winning" | "outbid" | "won" | "lost"
}

interface WonItem {
  id: string
  title: string
  photo: string | null
  winningBid: number
  paymentStatus: "NOT_STARTED" | "PENDING" | "COMPLETED"
  paymentMethod: "STRIPE" | "CHECK" | null
}

interface DashboardData {
  bids: BidItem[]
  wonItems: WonItem[]
  stats: {
    activeBids: number
    itemsWon: number
    itemsWinning: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/user/dashboard")
        if (res.ok) {
          const data = await res.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchDashboardData()
    }
  }, [session])

  if (status === "loading") {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <Image 
            src="/images/IMG_7446.jpeg" 
            alt="Loading..." 
            width={120}
            height={50}
            className="h-12 w-auto object-contain mx-auto mb-4 animate-pulse"
          />
          <p className="text-slate font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin
  const stats = dashboardData?.stats || { activeBids: 0, itemsWon: 0, itemsWinning: 0 }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-light/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image 
              src="/images/IMG_7446.jpeg" 
              alt="San Anselmo Cooperative Nursery School" 
              width={140}
              height={50}
              className="h-11 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auction" className="text-slate hover:text-violet font-medium transition-colors">
              Browse Auction
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-pearl rounded-full">
              <User className="w-4 h-4 text-slate" />
              <span className="font-semibold text-midnight">{session.user?.name}</span>
              {isAdmin && (
                <span className="badge badge-violet text-xs">Admin</span>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2 text-slate hover:text-coral hover:bg-coral/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-midnight mb-2">
            Hey, {session.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate text-lg">
            Here&apos;s your auction activity
          </p>
        </div>

        {/* Quick Stats - Compact */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-coral" />
              <p className="text-xl font-bold text-midnight">{stats.activeBids}</p>
            </div>
            <p className="text-silver text-xs font-medium">Active Bids</p>
          </div>
          <div className="card p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Gavel className="w-4 h-4 text-teal" />
              <p className="text-xl font-bold text-midnight">{stats.itemsWinning}</p>
            </div>
            <p className="text-silver text-xs font-medium">Winning</p>
          </div>
          <div className="card p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Package className="w-4 h-4 text-violet" />
              <p className="text-xl font-bold text-midnight">{stats.itemsWon}</p>
            </div>
            <p className="text-silver text-xs font-medium">Won</p>
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="card p-6 bg-gradient-to-r from-violet/5 to-coral/5 border border-violet/20 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet to-coral flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-midnight">Admin Dashboard</h3>
                <p className="text-slate text-sm">
                  Manage items, end auction, track payments
                </p>
              </div>
              <Link href="/admin" className="btn-primary">
                Open Admin
              </Link>
            </div>
          </div>
        )}

        {/* Browse Auction */}
        <div className="card p-6 bg-gradient-to-r from-coral/5 to-gold/5 border border-coral/20 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-gold flex items-center justify-center">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-midnight">Browse Auction Items</h3>
              <p className="text-slate text-sm">
                Discover amazing items and place your bids!
              </p>
            </div>
            <Link href="/auction" className="btn-coral flex items-center gap-2">
              Browse Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Donate an Item */}
        <div className="card p-6 bg-gradient-to-r from-teal/5 to-violet/5 border border-teal/20 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-violet flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-midnight">Donate an Item</h3>
              <p className="text-slate text-sm">
                Have something to contribute? Submit it for our auction!
              </p>
            </div>
            <Link href="/donate" className="btn-outline flex items-center gap-2">
              Donate Item
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet mx-auto mb-4" />
            <p className="text-slate">Loading your activity...</p>
          </div>
        ) : (
          <>
            {/* Items Won - Payment Needed */}
            {dashboardData?.wonItems && dashboardData.wonItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-midnight mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-violet" />
                  Items You Won
                </h2>
                <div className="space-y-4">
                  {dashboardData.wonItems.map((item) => (
                    <div key={item.id} className="card p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.photo ? (
                            <img src={item.photo} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Gavel className="w-8 h-8 text-slate opacity-30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-midnight">{item.title}</h3>
                          <p className="text-slate">Winning bid: <span className="font-semibold text-midnight">${item.winningBid}</span></p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.paymentStatus === "COMPLETED" ? (
                              <span className="flex items-center gap-1 text-sm text-teal font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Paid
                              </span>
                            ) : item.paymentStatus === "PENDING" && item.paymentMethod === "CHECK" ? (
                              <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                                <Clock className="w-4 h-4" />
                                Check Pending
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-sm text-coral font-medium">
                                <AlertCircle className="w-4 h-4" />
                                Payment Needed
                              </span>
                            )}
                          </div>
                        </div>
                        {item.paymentStatus !== "COMPLETED" && (
                          <Link 
                            href={`/auction/${item.id}`}
                            className="btn-coral flex items-center gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Bids */}
            {dashboardData?.bids && dashboardData.bids.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-midnight mb-4 flex items-center gap-2">
                  <Gavel className="w-6 h-6 text-coral" />
                  Your Bids
                </h2>
                <div className="space-y-4">
                  {dashboardData.bids.map((bid) => (
                    <div key={bid.id} className="card p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {bid.itemPhoto ? (
                            <img src={bid.itemPhoto} alt={bid.itemTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Gavel className="w-6 h-6 text-slate opacity-30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-midnight">{bid.itemTitle}</h3>
                          <p className="text-sm text-slate">
                            Your bid: <span className="font-semibold">${bid.amount}</span>
                            {bid.status === "outbid" && (
                              <span className="ml-2">• Current: <span className="font-semibold">${bid.currentBid}</span></span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {bid.status === "winning" && (
                              <span className="badge badge-teal text-xs">Winning!</span>
                            )}
                            {bid.status === "outbid" && (
                              <span className="badge badge-coral text-xs">Outbid</span>
                            )}
                            {bid.status === "won" && (
                              <span className="badge badge-violet text-xs">Won!</span>
                            )}
                            {bid.status === "lost" && (
                              <span className="badge bg-gray-200 text-gray-600 text-xs">Ended</span>
                            )}
                          </div>
                        </div>
                        <Link 
                          href={`/auction/${bid.itemId}`}
                          className="btn-outline flex items-center gap-2"
                        >
                          {bid.status === "outbid" ? "Bid Again" : "View"}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Activity */}
            {(!dashboardData?.bids || dashboardData.bids.length === 0) && 
             (!dashboardData?.wonItems || dashboardData.wonItems.length === 0) && (
              <div className="card p-12 text-center">
                <Gavel className="w-16 h-16 text-slate opacity-30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-midnight mb-2">No bids yet</h3>
                <p className="text-slate mb-6">Start browsing the auction to place your first bid!</p>
                <Link href="/auction" className="btn-coral inline-flex items-center gap-2">
                  Browse Auction
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
