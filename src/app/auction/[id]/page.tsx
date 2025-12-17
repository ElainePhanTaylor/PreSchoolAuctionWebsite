"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { 
  Trees, ArrowLeft, Heart, Clock, User, 
  Gavel, AlertCircle, CheckCircle, Share2
} from "lucide-react"

// Demo item data
const DEMO_ITEM = {
  id: "1",
  title: "Wine Country Weekend Getaway",
  description: `Escape to beautiful Sonoma wine country for a relaxing two-night stay at a charming vineyard cottage. This package includes:

• Two nights accommodation in a private cottage
• Welcome bottle of local wine
• Breakfast each morning
• Tasting passes at three local wineries

Perfect for a romantic getaway or a peaceful retreat. Valid for one year from auction date. Blackout dates may apply.`,
  category: "EXPERIENCES",
  currentBid: 450,
  startingBid: 200,
  minIncrement: 10,
  buyNowPrice: 800,
  bids: [
    { id: "1", username: "NatureLover22", amount: 450, time: "2 hours ago" },
    { id: "2", username: "WineEnthusiast", amount: 400, time: "5 hours ago" },
    { id: "3", username: "WeekendExplorer", amount: 350, time: "1 day ago" },
  ],
  donor: "The Smith Family",
  estimatedValue: 600,
  isFeatured: true,
  endsIn: "2 days, 4 hours",
  photos: ["/api/placeholder/800/600"],
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [bidAmount, setBidAmount] = useState(DEMO_ITEM.currentBid + DEMO_ITEM.minIncrement)
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [bidStatus, setBidStatus] = useState<"idle" | "success" | "error">("idle")
  const [bidError, setBidError] = useState("")

  const minBid = DEMO_ITEM.currentBid + DEMO_ITEM.minIncrement

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

    // TODO: API call to place bid
    setBidStatus("success")
    setTimeout(() => setBidStatus("idle"), 3000)
  }

  const handleBuyNow = async () => {
    if (!session) {
      router.push("/login")
      return
    }
    // TODO: Redirect to payment
    router.push(`/checkout/${id}?type=buynow`)
  }

  return (
    <div className="min-h-screen redwood-bg">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Trees className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-text">SACNS Auction</span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-text-muted hover:text-primary font-medium">
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
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
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
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center relative">
                <Gavel className="w-20 h-20 text-text-muted opacity-30" />
                {DEMO_ITEM.isFeatured && (
                  <div className="absolute top-4 left-4 bg-gold text-white text-sm font-semibold px-3 py-1 rounded">
                    Featured
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-text mb-4">Description</h2>
              <div className="text-text-muted whitespace-pre-line">
                {DEMO_ITEM.description}
              </div>
              
              <div className="border-t mt-6 pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <User className="w-4 h-4" />
                  <span>Donated by: <strong className="text-text">{DEMO_ITEM.donor}</strong></span>
                </div>
                <p className="text-sm text-text-muted mt-1">
                  Estimated value: ${DEMO_ITEM.estimatedValue}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Bidding */}
          <div>
            <div className="card p-6 sticky top-[120px]">
              {/* Category */}
              <div className="text-sm text-primary font-semibold uppercase mb-2">
                {DEMO_ITEM.category.replace("_", " ")}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-text mb-4">
                {DEMO_ITEM.title}
              </h1>

              {/* Time Remaining */}
              <div className="flex items-center gap-2 text-text-muted mb-6">
                <Clock className="w-5 h-5" />
                <span>Ends in: <strong className="text-text">{DEMO_ITEM.endsIn}</strong></span>
              </div>

              {/* Current Bid */}
              <div className="bg-cream rounded-lg p-4 mb-6">
                <p className="text-sm text-text-muted mb-1">Current Bid</p>
                <p className="text-4xl font-bold text-primary">${DEMO_ITEM.currentBid}</p>
                <p className="text-sm text-text-muted">{DEMO_ITEM.bids.length} bids</p>
              </div>

              {/* Bid Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-2">
                  Your Bid (minimum ${minBid})
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      min={minBid}
                      step={DEMO_ITEM.minIncrement}
                      className="input pl-8"
                    />
                  </div>
                  <button
                    onClick={handleBid}
                    className="btn-gold whitespace-nowrap"
                  >
                    Place Bid
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Minimum increment: ${DEMO_ITEM.minIncrement}
                </p>
              </div>

              {/* Bid Status Messages */}
              {bidStatus === "success" && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Your bid has been placed!</span>
                </div>
              )}
              {bidStatus === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{bidError}</span>
                </div>
              )}

              {/* Buy Now */}
              {DEMO_ITEM.buyNowPrice && (
                <div className="border-t pt-4 mb-4">
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-text text-white py-3 rounded-lg font-semibold hover:bg-text/90 transition-colors"
                  >
                    Buy Now for ${DEMO_ITEM.buyNowPrice}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium border-2 transition-colors flex items-center justify-center gap-2 ${
                    isWatchlisted 
                      ? "border-red-500 text-red-500 bg-red-50" 
                      : "border-gray-200 text-text-muted hover:border-gray-300"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWatchlisted ? "fill-current" : ""}`} />
                  {isWatchlisted ? "Watchlisted" : "Add to Watchlist"}
                </button>
                <button className="py-2 px-4 rounded-lg border-2 border-gray-200 text-text-muted hover:border-gray-300 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Bid History */}
              <div className="border-t mt-6 pt-6">
                <h3 className="font-semibold text-text mb-3">Recent Bids</h3>
                <div className="space-y-2">
                  {DEMO_ITEM.bids.map((bid, index) => (
                    <div 
                      key={bid.id} 
                      className={`flex justify-between items-center py-2 ${
                        index === 0 ? "text-primary font-medium" : "text-text-muted"
                      }`}
                    >
                      <span>{bid.username}</span>
                      <div className="text-right">
                        <span className="font-semibold">${bid.amount}</span>
                        <span className="text-xs ml-2">{bid.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
