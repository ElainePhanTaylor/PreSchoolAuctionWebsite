"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { 
  ArrowLeft, Clock, User, 
  Gavel, AlertCircle, CheckCircle, Loader2
} from "lucide-react"

interface Bid {
  id: string
  amount: number
  createdAt: string
  user: { username: string }
}

interface AuctionItem {
  id: string
  title: string
  description: string
  category: string
  currentBid: number | null
  startingBid: number
  estimatedValue: number | null
  isFeatured: boolean
  photos: { url: string }[]
  donor: { username: string }
  _count: { bids: number }
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  
  const [item, setItem] = useState<AuctionItem | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [bidAmount, setBidAmount] = useState(0)
  const [bidStatus, setBidStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [bidError, setBidError] = useState("")

  const minIncrement = 10
  const currentBid = item?.currentBid ?? item?.startingBid ?? 0
  const minBid = currentBid + minIncrement

  // Fetch item and bids
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch item
        const itemRes = await fetch(`/api/items/${id}`)
        if (!itemRes.ok) throw new Error("Item not found")
        const itemData = await itemRes.json()
        setItem(itemData)
        setBidAmount((itemData.currentBid ?? itemData.startingBid) + minIncrement)
        
        // Fetch bids
        const bidsRes = await fetch(`/api/bids?itemId=${id}`)
        if (bidsRes.ok) {
          const bidsData = await bidsRes.json()
          setBids(bidsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load item")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  const handleBid = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    if (bidAmount < minBid) {
      setBidStatus("error")
      setBidError(`Minimum bid is $${minBid}`)
      return
    }

    setBidStatus("submitting")
    setBidError("")

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, amount: bidAmount }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to place bid")
      }

      setBidStatus("success")
      
      // Refresh item and bids
      const itemRes = await fetch(`/api/items/${id}`)
      if (itemRes.ok) {
        const itemData = await itemRes.json()
        setItem(itemData)
        setBidAmount((itemData.currentBid ?? itemData.startingBid) + minIncrement)
      }
      
      const bidsRes = await fetch(`/api/bids?itemId=${id}`)
      if (bidsRes.ok) {
        setBids(await bidsRes.json())
      }

      setTimeout(() => setBidStatus("idle"), 3000)
    } catch (err) {
      setBidStatus("error")
      setBidError(err instanceof Error ? err.message : "Failed to place bid")
    }
  }

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet" />
        <span className="ml-3 text-slate">Loading item...</span>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-pearl flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-midnight mb-2">Item not found</h2>
        <p className="text-slate mb-4">{error}</p>
        <Link href="/auction" className="btn-primary">
          Back to Auction
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/images/IMG_7446.jpeg" 
              alt="SACNS" 
              width={100} 
              height={40} 
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-slate hover:text-violet font-medium">
                  Log In
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Back Link */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link 
          href="/auction" 
          className="inline-flex items-center gap-2 text-slate hover:text-violet transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Auction
        </Link>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Image & Details */}
          <div>
            {/* Image */}
            <div className="card overflow-hidden mb-6">
              <div className="aspect-[4/3] bg-gray-100 relative">
                {item.photos[0]?.url ? (
                  <Image 
                    src={item.photos[0].url} 
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gavel className="w-20 h-20 text-slate opacity-30" />
                  </div>
                )}
                {item.isFeatured && (
                  <div className="absolute top-4 left-4 badge badge-coral">
                    Featured
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-midnight mb-4">Description</h2>
              <div className="text-slate whitespace-pre-line">
                {item.description}
              </div>
              
              <div className="border-t mt-6 pt-6">
                <div className="flex items-center gap-2 text-slate">
                  <User className="w-4 h-4" />
                  <span>Donated by: <strong className="text-midnight">{item.donor?.username || "Anonymous"}</strong></span>
                </div>
                {item.estimatedValue && (
                  <p className="text-sm text-silver mt-1">
                    Estimated value: ${item.estimatedValue}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Bidding */}
          <div>
            <div className="card p-6 sticky top-[120px]">
              {/* Category */}
              <div className="badge badge-violet mb-2">
                {item.category.replace("_", " ")}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-midnight mb-4">
                {item.title}
              </h1>

              {/* Time Remaining */}
              <div className="flex items-center gap-2 text-slate mb-6">
                <Clock className="w-5 h-5" />
                <span>Auction is <strong className="text-midnight">Active</strong></span>
              </div>

              {/* Current Bid */}
              <div className="bg-violet/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate mb-1">
                  {item._count.bids > 0 ? "Current Bid" : "Starting Bid"}
                </p>
                <p className="text-4xl font-extrabold text-midnight">${currentBid}</p>
                <p className="text-sm text-slate">{item._count.bids} bids</p>
              </div>

              {/* Bid Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-midnight mb-2">
                  Your Bid (minimum ${minBid})
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate">$</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      min={minBid}
                      step={minIncrement}
                      className="input pl-8"
                      disabled={bidStatus === "submitting"}
                    />
                  </div>
                  <button
                    onClick={handleBid}
                    disabled={bidStatus === "submitting"}
                    className="btn-coral whitespace-nowrap disabled:opacity-50"
                  >
                    {bidStatus === "submitting" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Place Bid"
                    )}
                  </button>
                </div>
                <p className="text-xs text-silver mt-1">
                  Minimum increment: ${minIncrement}
                </p>
              </div>

              {/* Bid Status Messages */}
              {bidStatus === "success" && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Your bid has been placed!</span>
                </div>
              )}
              {bidStatus === "error" && (
                <div className="bg-coral/10 border border-coral/20 text-coral px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{bidError}</span>
                </div>
              )}

              {/* Bid History */}
              <div className="border-t mt-6 pt-6">
                <h3 className="font-semibold text-midnight mb-3">Recent Bids</h3>
                {bids.length === 0 ? (
                  <p className="text-slate text-sm">No bids yet. Be the first!</p>
                ) : (
                  <div className="space-y-2">
                    {bids.slice(0, 5).map((bid, index) => (
                      <div 
                        key={bid.id} 
                        className={`flex justify-between items-center py-2 ${
                          index === 0 ? "text-violet font-medium" : "text-slate"
                        }`}
                      >
                        <span>{bid.user.username}</span>
                        <div className="text-right">
                          <span className="font-semibold">${bid.amount}</span>
                          <span className="text-xs text-silver ml-2">{timeAgo(bid.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
