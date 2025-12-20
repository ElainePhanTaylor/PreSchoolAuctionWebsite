"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gavel, Heart, Zap, X, AlertCircle } from "lucide-react"

interface BidFormProps {
  itemId: string
  itemTitle: string
  minBid: number
  buyNowPrice: number | null
  isWatching: boolean
}

export function BidForm({ itemId, itemTitle, minBid, buyNowPrice, isWatching }: BidFormProps) {
  const router = useRouter()
  const [bidAmount, setBidAmount] = useState(minBid.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [watching, setWatching] = useState(isWatching)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingAmount, setPendingAmount] = useState(0)

  // Step 1: Validate and show confirmation
  const handleBidClick = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount < minBid) {
      setError(`Minimum bid is $${Math.ceil(minBid)}`)
      return
    }

    // Show confirmation popup
    setPendingAmount(Math.floor(amount))
    setShowConfirm(true)
  }

  // Step 2: Actually place the bid
  const confirmBid = async () => {
    setShowConfirm(false)
    setLoading(true)

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, amount: pendingAmount }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to place bid")
      } else {
        router.refresh()
        setBidAmount((pendingAmount + 10).toString())
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (!buyNowPrice) return
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/bids/buy-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to buy now")
      } else {
        router.push(`/checkout/${itemId}`)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const toggleWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist", {
        method: watching ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })

      if (res.ok) {
        setWatching(!watching)
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="space-y-4">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-midnight">Confirm Your Bid</h3>
              <button 
                onClick={() => setShowConfirm(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">
                    You are about to bid <span className="text-xl font-bold">${pendingAmount}</span>
                  </p>
                  <p className="text-amber-700 text-sm mt-1">
                    on &ldquo;{itemTitle}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate mb-6">
              By confirming, you agree to pay this amount if you win. Bids cannot be retracted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBid}
                className="flex-1 px-4 py-3 bg-coral text-white rounded-xl font-semibold hover:bg-coral/90 transition-colors flex items-center justify-center gap-2"
              >
                <Gavel className="w-5 h-5" />
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleBidClick} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-semibold">$</span>
          <input
            type="number"
            min={minBid}
            step="1"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="input pl-8 text-lg font-semibold"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold flex items-center gap-2 disabled:opacity-50"
        >
          <Gavel className="w-5 h-5" />
          {loading ? "..." : "Place Bid"}
        </button>
      </form>

      <p className="text-sm text-text-muted text-center">
        Minimum bid: ${Math.ceil(minBid)} ($10 increment)
      </p>

      <div className="flex gap-3">
        {buyNowPrice && (
          <button
            onClick={handleBuyNow}
            disabled={loading}
            className="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Zap className="w-5 h-5" />
            Buy Now - ${Math.ceil(buyNowPrice)}
          </button>
        )}
        
        <button
          onClick={toggleWatchlist}
          className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            watching
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-cream text-text-muted hover:bg-cream/80"
          }`}
        >
          <Heart className={`w-5 h-5 ${watching ? "fill-current" : ""}`} />
          {watching ? "Watching" : "Watch"}
        </button>
      </div>
    </div>
  )
}

