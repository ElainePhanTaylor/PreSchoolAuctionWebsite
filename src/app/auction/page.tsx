"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { 
  Search, Clock, 
  ChevronDown, Grid, List, TrendingUp, Loader2
} from "lucide-react"

const CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "EXPERIENCES", label: "Experiences" },
  { value: "GIFT_CARDS", label: "Gift Cards" },
  { value: "HOME_HOUSEHOLD", label: "Home & Household" },
  { value: "SERVICES", label: "Services" },
  { value: "HANDMADE", label: "Handmade" },
  { value: "ART", label: "Art" },
  { value: "FOOD_DINING", label: "Food & Dining" },
  { value: "SPORTS", label: "Sports" },
  { value: "KIDS", label: "Kids" },
  { value: "OTHER", label: "Other" },
]

// Item type from API
interface AuctionItem {
  id: string
  title: string
  description: string
  category: string
  currentBid: number | null
  startingBid: number
  isFeatured: boolean
  photos: { url: string; order: number }[]
  _count: { bids: number }
}

export default function AuctionPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<AuctionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch items from API
  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true)
        const res = await fetch("/api/items")
        if (!res.ok) throw new Error("Failed to fetch items")
        const data = await res.json()
        setItems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load items")
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-pearl">
      {/* Hero Banner with Forest Background */}
      <div className="relative h-32 md:h-40 overflow-hidden">
        <Image 
          src="/images/forestbanner.png" 
          alt="Forest background" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight/70 to-midnight/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
            Browse Auction Items
          </h1>
        </div>
      </div>

      {/* Search Bar - Sticky at Top */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-light/10 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Home Link */}
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/images/IMG_7446.jpeg" 
                alt="Home" 
                width={100}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full py-2.5 pl-10 pr-4 border-2 border-slate-light/20 rounded-full text-sm bg-pearl/50 focus:outline-none focus:border-violet focus:bg-white transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative hidden sm:block">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2.5 pl-4 pr-8 border-2 border-slate-light/20 rounded-full text-sm bg-pearl/50 focus:outline-none focus:border-violet focus:bg-white transition-all appearance-none cursor-pointer min-w-[160px]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-pearl rounded-full p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full transition-all ${
                  viewMode === "grid" ? "bg-white shadow-md text-midnight" : "text-silver hover:text-midnight"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full transition-all ${
                  viewMode === "list" ? "bg-white shadow-md text-midnight" : "text-silver hover:text-midnight"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Auth Links */}
            <div className="hidden md:flex items-center gap-2">
              {session ? (
                <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-midnight font-semibold hover:text-violet transition-colors text-sm">
                    Log In
                  </Link>
                  <Link href="/register" className="btn-primary text-sm py-2 px-4">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Category Filter */}
          <div className="sm:hidden mt-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 pl-4 pr-8 border-2 border-slate-light/20 rounded-full text-sm bg-pearl/50 focus:outline-none focus:border-violet focus:bg-white transition-all appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet" />
            <span className="ml-3 text-slate">Loading items...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-midnight mb-2">Something went wrong</h2>
            <p className="text-slate">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-midnight mb-2">No items found</h2>
            <p className="text-slate">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/auction/${item.id}`}
                className={`card overflow-hidden group cursor-pointer ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                {/* Image */}
                <div className={`relative ${
                  viewMode === "list" ? "w-48 flex-shrink-0" : ""
                }`}>
                  <div className={`overflow-hidden ${
                    viewMode === "list" ? "h-full" : "aspect-[4/3]"
                  }`}>
                    <Image 
                      src={item.photos[0]?.url || "/images/placeholder.png"} 
                      alt={item.title} 
                      width={400} 
                      height={300} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {item.isFeatured && (
                    <div className="absolute top-3 left-3 badge badge-coral">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1">
                  <div className="badge badge-violet mb-2">
                    {CATEGORIES.find(c => c.value === item.category)?.label}
                  </div>
                  <h3 className="text-lg font-bold text-midnight mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-slate text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-silver">{item._count.bids > 0 ? "Current Bid" : "Starting Bid"}</p>
                      <p className="text-2xl font-extrabold text-midnight">${item.currentBid ?? item.startingBid}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-slate text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{item._count.bids} bids</span>
                      </div>
                      <div className="flex items-center gap-1 text-silver text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
