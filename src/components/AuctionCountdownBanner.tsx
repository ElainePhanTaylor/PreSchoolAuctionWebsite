"use client"

import { useState, useEffect } from "react"
import { CalendarClock, Clock } from "lucide-react"

export function AuctionCountdownBanner() {
  const [auctionEndTime, setAuctionEndTime] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState<{
    days: number; hours: number; minutes: number; seconds: number
  } | null>(null)
  const [auctionEnded, setAuctionEnded] = useState(false)

  useEffect(() => {
    fetch("/api/auction/settings")
      .then(r => r.json())
      .then(data => {
        if (data.auctionEndTime) setAuctionEndTime(new Date(data.auctionEndTime))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!auctionEndTime) return
    function tick() {
      const diff = auctionEndTime!.getTime() - Date.now()
      if (diff <= 0) { setAuctionEnded(true); setCountdown(null); return }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [auctionEndTime])

  if (!auctionEndTime) return null

  return (
    <div className={`py-2 px-4 text-center text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-[60] ${auctionEnded ? "bg-red-50 text-red-700" : "bg-violet/10 text-violet"}`}>
      {auctionEnded ? (
        <><Clock className="w-4 h-4" /> Auction Has Ended</>
      ) : countdown && (
        <>
          <CalendarClock className="w-4 h-4 hidden sm:block" />
          <span className="hidden sm:inline">
            Auction ends {auctionEndTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
          <span className="sm:hidden">
            Ends {auctionEndTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="bg-white/80 rounded-lg px-2.5 py-0.5 tabular-nums font-bold text-midnight">
            {countdown.days}d {String(countdown.hours).padStart(2, "0")}h {String(countdown.minutes).padStart(2, "0")}m {String(countdown.seconds).padStart(2, "0")}s
          </span>
        </>
      )}
    </div>
  )
}
