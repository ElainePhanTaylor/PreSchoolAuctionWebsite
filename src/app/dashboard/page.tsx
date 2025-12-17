"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Gavel, Gift, Settings, LogOut, User, 
  TrendingUp, Heart, Package, ArrowRight 
} from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
            <div className="flex items-center gap-2 px-4 py-2 bg-pearl rounded-full">
              <User className="w-4 h-4 text-slate" />
              <span className="font-semibold text-midnight">{session.user?.name}</span>
              {isAdmin && (
                <span className="badge badge-violet text-xs">Admin</span>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 text-slate hover:text-coral rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-midnight mb-2">
            Hey, {session.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate text-lg">
            What would you like to do today?
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Bid on Items */}
          <Link href="/auction" className="card p-8 group cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Gavel className="w-8 h-8 text-white" />
              </div>
              <ArrowRight className="w-6 h-6 text-silver group-hover:text-coral group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-2xl font-bold text-midnight mb-2">Bid on Items</h2>
            <p className="text-slate">
              Browse amazing auction items and place your bids. Find experiences, gift cards, and more!
            </p>
          </Link>

          {/* Donate an Item */}
          <Link href="/donate" className="card p-8 group cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <ArrowRight className="w-6 h-6 text-silver group-hover:text-violet group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-2xl font-bold text-midnight mb-2">Donate an Item</h2>
            <p className="text-slate">
              Have something to contribute? Upload photos and details to support the school.
            </p>
          </Link>
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
                  Manage items, approve donations, track payments
                </p>
              </div>
              <Link href="/admin" className="btn-primary">
                Open Admin
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-coral" />
            </div>
            <p className="text-3xl font-extrabold text-midnight">0</p>
            <p className="text-silver text-sm font-medium">Active Bids</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-violet/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-violet" />
            </div>
            <p className="text-3xl font-extrabold text-midnight">0</p>
            <p className="text-silver text-sm font-medium">Watchlist</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-teal" />
            </div>
            <p className="text-3xl font-extrabold text-midnight">0</p>
            <p className="text-silver text-sm font-medium">Items Won</p>
          </div>
        </div>
      </main>
    </div>
  )
}
