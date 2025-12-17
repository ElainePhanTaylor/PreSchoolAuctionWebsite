"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { 
  Search, Heart, Clock, 
  ChevronDown, Grid, List, TrendingUp
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
    image: "/images/wine.png",
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
    image: "/images/wholefoods.png",
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
    image: "/images/quilt.jpeg",
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
    image: "/images/portraitsession.png",
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
    image: "/images/italian.png",
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
    image: "/images/kidscamp.jpeg",
    isFeatured: false,
    endsIn: "2 days",
  },
  {
    id: "7",
    title: "Beach House Weekend",
    description: "Relaxing weekend getaway at a beautiful beach house",
    category: "EXPERIENCES",
    currentBid: 650,
    bids: 12,
    image: "/images/beachhouse.png",
    isFeatured: true,
    endsIn: "2 days",
  },
  {
    id: "8",
    title: "Pizza Party Package",
    description: "Pizza party for 10 kids with drinks and dessert",
    category: "FOOD_DINING",
    currentBid: 85,
    bids: 6,
    image: "/images/pizza.png",
    isFeatured: false,
    endsIn: "2 days",
  },
  {
    id: "9",
    title: "Spa Day for Two",
    description: "Full spa treatment including massage and facial",
    category: "SERVICES",
    currentBid: 320,
    bids: 9,
    image: "/images/spa.png",
    isFeatured: true,
    endsIn: "2 days",
  },
  {
    id: "10",
    title: "Art Class Bundle",
    description: "4 art classes for children at local studio",
    category: "ART",
    currentBid: 180,
    bids: 5,
    image: "/images/artclass.png",
    isFeatured: false,
    endsIn: "2 days",
  },
  {
    id: "11",
    title: "Gift Card Bundle",
    description: "Collection of local restaurant and shop gift cards",
    category: "GIFT_CARDS",
    currentBid: 120,
    bids: 3,
    image: "/images/giftcards.png",
    isFeatured: false,
    endsIn: "2 days",
  },
  {
    id: "12",
    title: "Redwood Forest Adventure",
    description: "Guided nature hike through Muir Woods with picnic lunch",
    category: "EXPERIENCES",
    currentBid: 275,
    bids: 7,
    image: "/images/redwood.png",
    isFeatured: true,
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
                  <div className={`overflow-hidden ${
                    viewMode === "list" ? "h-full" : "aspect-[4/3]"
                  }`}>
                    <Image 
                      src={item.image} 
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
