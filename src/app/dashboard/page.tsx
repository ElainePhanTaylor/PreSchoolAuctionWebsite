"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Gavel, Settings,
  TrendingUp, Package, ArrowRight, AlertCircle,
  CheckCircle, CreditCard, Clock, Loader2
} from "lucide-react"
import Header from "@/components/Header"

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

  const isAdmin = (session.user as any)?.isAdmin
  const stats = dashboardData?.stats || { activeBids: 0, itemsWon: 0, itemsWinning: 0 }

  return (
    <div className="min-h-screen gradient-mesh">
      <Header />

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

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-coral" />
            </div>
            <p className="text-3xl font-extrabold text-midnight">{stats.activeBids}</p>
            <p className="text-silver text-sm font-medium">Active Bids</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-3">
              <Gavel className="w-6 h-6 text-teal" />
            </div>
            <p className="text-3xl font-extrabold text-midnight">{stats.itemsWinning}</p>
            <p className="text-silver text-sm font-medium">Currently Winning</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-violet/10 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-violet" />
            </div>
            <p className="text-3xl font-extrabold text-midnight">{stats.itemsWon}</p>
            <p className="text-silver text-sm font-medium">Items Won</p>
          </div>
        </div>

        {/* Browse Auction Banner */}
        <Link 
          href="/auction" 
          className="block p-8 mb-8 rounded-2xl text-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #8B5CF6 50%, #2DD4BF 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Gavel className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold mb-1">Browse Auction</h2>
                <p className="text-white/80 text-lg">
                  Discover amazing items and place your bids!
                </p>
              </div>
            </div>
            <ArrowRight className="w-8 h-8 text-white/80 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

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
