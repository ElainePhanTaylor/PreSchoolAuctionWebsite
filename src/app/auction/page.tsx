"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { 
  Search, Heart, Clock, 
  ChevronDown, Grid, List, TrendingUp, Filter
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

const DEMO_ITEMS = [
  {
    id: "1",
    title: "Wine Country Weekend Getaway",
    description: "Two nights at a beautiful Sonoma vineyard cottage",
    category: "EXPERIENCES",
    currentBid: 450,
    bids: 8,
    emoji: "🍷",
    isFeatured: true,
    endsIn: "2 days",
  },
  {
    id: "2", 
    title: "$100 Whole Foods Gift Card",
    description: "Stock up on organic groceries",
    category: "GIFT_CARDS",
    currentBid: 75,
    bids: 3,
    emoji: "🛒",
    isFeatured: false,
    endsIn: "2 days",
  },
  {
    id: "3",
    title: "Handmade Quilt by Local Artist",
    description: "Beautiful queen-size patchwork quilt",
    category: "HANDMADE",
    currentBid: 180,
    bids: 5,
    emoji: "🧵",
    isFeatured: true,
    endsIn: "2 days",
  },
  {
    id: "4",
    title: "Family Portrait Session",
    description: "Professional photography session with prints",
    category: "SERVICES",
    currentBid: 250,
    bids: 6,
    emoji: "📸",
    isFeatured: false,
    endsIn: "2 days",
  },
  {
    id: "5",
    title: "Italian Dinner for 6",
    description: "Chef-prepared meal in your home",
    category: "FOOD_DINING",
    currentBid: 320,
    bids: 7,
    emoji: "🍝",
    isFeatured: true,
    endsIn: "2 days",
  },
  {
    id: "6",
    title: "Kids Art Camp Week",
    description: "One week of summer art camp",
    category: "KIDS",
    currentBid: 200,
    bids: 4,
    emoji: "🎨",
    isFeatured: false,
    endsIn: "2 days",
  },
]

export default function AuctionPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredItems = DEMO_ITEMS.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-pearl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-light/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/images/IMG_7446.jpeg" 
              alt="San Anselmo Cooperative Nursery School" 
              width={140}
              height={50}
              className="h-11 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-midnight font-semibold hover:text-violet transition-colors">
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

      {/* Hero */}
      <div className="bg-gradient-to-r from-violet to-coral py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Browse Auction Items
          </h1>
          <p className="text-white/80 text-lg">
            Discover unique items and experiences. Place your bids and win!
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="input pl-12"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input pl-12 pr-10 appearance-none cursor-pointer min-w-[200px]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-pearl rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-white shadow-md text-midnight" : "text-silver hover:text-midnight"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-white shadow-md text-midnight" : "text-silver hover:text-midnight"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {filteredItems.length === 0 ? (
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
                  <div className={`bg-gradient-to-br from-pearl to-slate-light/20 flex items-center justify-center ${
                    viewMode === "list" ? "h-full" : "aspect-[4/3]"
                  }`}>
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                      {item.emoji}
                    </span>
                  </div>
                  {item.isFeatured && (
                    <div className="absolute top-3 left-3 badge badge-coral">
                      Featured
                    </div>
                  )}
                  <button 
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    <Heart className="w-4 h-4 text-silver hover:text-coral transition-colors" />
                  </button>
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
                      <p className="text-sm text-silver">Current Bid</p>
                      <p className="text-2xl font-extrabold text-midnight">${item.currentBid}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-slate text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{item.bids} bids</span>
                      </div>
                      <div className="flex items-center gap-1 text-silver text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{item.endsIn}</span>
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
