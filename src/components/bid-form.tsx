"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gavel, Heart, Zap } from "lucide-react"

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
      {/* Confirmation Modal - Simple */}
      {showConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg text-midnight mb-6">
              Bid <span className="font-bold">${pendingAmount}</span> on this item?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBid}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                ✓ Yes, Bid
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

