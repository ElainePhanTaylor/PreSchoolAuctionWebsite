"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

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

  if (auctionEnded) {
    return (
      <div className="bg-red-600 text-white py-3 px-4 text-center sticky top-0 z-[60]">
        <div className="flex items-center justify-center gap-2 text-lg font-bold">
          <Clock className="w-5 h-5" />
          Auction Has Ended
        </div>
      </div>
    )
  }

  if (!countdown) return null

  return (
    <div className="bg-gradient-to-r from-violet to-indigo-600 text-white py-3 px-4 text-center sticky top-0 z-[60] shadow-md">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs sm:text-sm font-medium opacity-90 mb-1">
          Auction ends {auctionEndTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {auctionEndTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {[
            { value: countdown.days, label: "DAYS" },
            { value: countdown.hours, label: "HRS" },
            { value: countdown.minutes, label: "MIN" },
            { value: countdown.seconds, label: "SEC" },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg w-12 sm:w-14 h-10 sm:h-12 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-extrabold tabular-nums">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs font-semibold mt-0.5 opacity-80">{unit.label}</p>
              </div>
              {i < 3 && <span className="text-xl font-bold opacity-60 -mt-4">:</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
