"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { 
  Trees, ArrowLeft, Heart, Clock, User, 
  Gavel, AlertCircle, CheckCircle, Share2, ChevronLeft, ChevronRight
} from "lucide-react"

// Demo items data - matches the auction page
const itemS = [
  {
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
    photos: ["/images/wine.jpg"],
  },
  {
    id: "2",
    title: "$100 Whole Foods Gift Card",
    description: `Stock up on organic groceries with this $100 Whole Foods gift card. Perfect for healthy eating!

• Valid at any Whole Foods location
• No expiration date
• Can be used for groceries, prepared foods, and more`,
    category: "GIFT_CARDS",
    currentBid: 75,
    startingBid: 50,
    minIncrement: 5,
    buyNowPrice: 100,
    bids: [
      { id: "1", username: "HealthyEater", amount: 75, time: "3 hours ago" },
      { id: "2", username: "OrganicFan", amount: 65, time: "8 hours ago" },
    ],
    donor: "Anonymous",
    estimatedValue: 100,
    isFeatured: false,
    endsIn: "3 days, 2 hours",
    photos: ["/images/wholefoods.png"],
  },
  {
    id: "3",
    title: "Handmade Quilt by Local Artist",
    description: `A beautiful queen-size patchwork quilt handcrafted by a local Marin County artist.

• Queen size (90" x 90")
• Machine washable
• Unique one-of-a-kind design
• Made with high-quality cotton fabrics`,
    category: "HANDMADE",
    currentBid: 180,
    startingBid: 100,
    minIncrement: 10,
    buyNowPrice: 350,
    bids: [
      { id: "1", username: "CozyHome", amount: 180, time: "1 day ago" },
      { id: "2", username: "ArtLover", amount: 150, time: "2 days ago" },
    ],
    donor: "Jane's Quilts",
    estimatedValue: 300,
    isFeatured: false,
    endsIn: "4 days, 6 hours",
    photos: ["/images/quilt.jpeg"],
  },
  {
    id: "4",
    title: "Family Portrait Session",
    description: `Professional photography session with prints included!

• 1-hour session at location of your choice
• 10 professionally edited digital images
• One 11x14 print
• Valid for up to 6 family members`,
    category: "SERVICES",
    currentBid: 250,
    startingBid: 150,
    minIncrement: 10,
    buyNowPrice: 450,
    bids: [
      { id: "1", username: "FamilyFirst", amount: 250, time: "4 hours ago" },
      { id: "2", username: "MemoryMaker", amount: 200, time: "1 day ago" },
    ],
    donor: "Marin Photography Studio",
    estimatedValue: 400,
    isFeatured: false,
    endsIn: "1 day, 8 hours",
    photos: ["/images/portraitsession.png"],
  },
  {
    id: "5",
    title: "Italian Dinner for 6",
    description: `Enjoy an authentic Italian dinner prepared by a professional chef in your home!

• 4-course meal for up to 6 guests
• Includes appetizers, pasta, main course, and dessert
• Wine pairings included
• Chef handles all cooking and cleanup`,
    category: "FOOD_DINING",
    currentBid: 320,
    startingBid: 200,
    minIncrement: 15,
    buyNowPrice: 550,
    bids: [
      { id: "1", username: "Foodie123", amount: 320, time: "6 hours ago" },
      { id: "2", username: "DinnerPartyHost", amount: 275, time: "1 day ago" },
    ],
    donor: "Chef Marco",
    estimatedValue: 500,
    isFeatured: true,
    endsIn: "2 days, 12 hours",
    photos: ["/images/italian.png"],
  },
  {
    id: "6",
    title: "Kids Art Camp Week",
    description: `One week of summer art camp for your creative kid!

• Monday-Friday, 9am-3pm
• Ages 5-12
• All materials included
• End-of-week art show for families`,
    category: "KIDS",
    currentBid: 200,
    startingBid: 150,
    minIncrement: 10,
    buyNowPrice: 350,
    bids: [
      { id: "1", username: "ArtMom", amount: 200, time: "2 days ago" },
      { id: "2", username: "CreativeKids", amount: 175, time: "3 days ago" },
    ],
    donor: "San Anselmo Art Studio",
    estimatedValue: 300,
    isFeatured: false,
    endsIn: "5 days, 3 hours",
    photos: ["/images/kidscamp.jpeg"],
  },
  {
    id: "7",
    title: "Pizza Party Package",
    description: `Host the ultimate pizza party for your kids!

• Pizza party for up to 12 kids
• Drinks and dessert included
• 2-hour party at participating location
• Party host included`,
    category: "FOOD_DINING",
    currentBid: 85,
    startingBid: 50,
    minIncrement: 5,
    buyNowPrice: 150,
    bids: [
      { id: "1", username: "PartyPlanner", amount: 85, time: "1 day ago" },
      { id: "2", username: "PizzaLover", amount: 70, time: "2 days ago" },
    ],
    donor: "Mill Valley Pizza Co.",
    estimatedValue: 120,
    isFeatured: false,
    endsIn: "3 days, 5 hours",
    photos: ["/images/pizza.png"],
  },
  {
    id: "8",
    title: "Beach House Weekend",
    description: `Two nights at a beautiful coastal getaway in Stinson Beach!

• 3-bedroom house sleeps 6
• Ocean views
• Full kitchen
• Beach access steps away`,
    category: "EXPERIENCES",
    currentBid: 650,
    startingBid: 400,
    minIncrement: 25,
    buyNowPrice: 1000,
    bids: [
      { id: "1", username: "BeachBum", amount: 650, time: "5 hours ago" },
      { id: "2", username: "SunSeeker", amount: 550, time: "12 hours ago" },
      { id: "3", username: "CoastalDreams", amount: 475, time: "1 day ago" },
    ],
    donor: "The Johnson Family",
    estimatedValue: 900,
    isFeatured: true,
    endsIn: "1 day, 2 hours",
    photos: ["/images/beachhouse.png"],
  },
  {
    id: "9",
    title: "Spa Day for Two",
    description: `Relaxing spa treatments for you and a friend!

• 60-minute massage for two
• Access to sauna and steam room
• Complimentary refreshments
• Valid at Marin Spa & Wellness`,
    category: "SERVICES",
    currentBid: 320,
    startingBid: 200,
    minIncrement: 15,
    buyNowPrice: 500,
    bids: [
      { id: "1", username: "RelaxMode", amount: 320, time: "8 hours ago" },
      { id: "2", username: "SpaLover", amount: 280, time: "1 day ago" },
    ],
    donor: "Marin Spa & Wellness",
    estimatedValue: 450,
    isFeatured: false,
    endsIn: "2 days, 8 hours",
    photos: ["/images/spa.png"],
  },
  {
    id: "10",
    title: "Art Class Bundle",
    description: `8 weeks of art classes for kids or adults!

• Choose from painting, drawing, or ceramics
• All materials included
• Small class sizes
• Flexible scheduling`,
    category: "KIDS",
    currentBid: 180,
    startingBid: 100,
    minIncrement: 10,
    buyNowPrice: 300,
    bids: [
      { id: "1", username: "ArtStudent", amount: 180, time: "2 days ago" },
      { id: "2", username: "CreativeSpirit", amount: 140, time: "3 days ago" },
    ],
    donor: "The Art Loft",
    estimatedValue: 280,
    isFeatured: false,
    endsIn: "4 days, 1 hour",
    photos: ["/images/artclass.png"],
  },
  {
    id: "11",
    title: "Gift Card Bundle",
    description: `Collection of local restaurant and shop gift cards!

• $50 to Mill Valley Beerworks
• $50 to Book Passage
• $50 to Good Earth Natural Foods
• $25 to Peet's Coffee`,
    category: "GIFT_CARDS",
    currentBid: 120,
    startingBid: 100,
    minIncrement: 5,
    buyNowPrice: 175,
    bids: [
      { id: "1", username: "LocalLover", amount: 120, time: "1 day ago" },
    ],
    donor: "SACNS Parent Association",
    estimatedValue: 175,
    isFeatured: false,
    endsIn: "6 days, 4 hours",
    photos: ["/images/giftcards.png"],
  },
]

export default function ItemDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  
  // Find the item by ID
  const item = itemS.find(i => i.id === id) || itemS[0]
  
  const [bidAmount, setBidAmount] = useState(item.currentBid + item.minIncrement)
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [bidStatus, setBidStatus] = useState<"idle" | "success" | "error">("idle")
  const [bidError, setBidError] = useState("")
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % item.photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + item.photos.length) % item.photos.length)
  }

  const minBid = item.currentBid + item.minIncrement

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
          className="inline-flex items-center gap-3 text-lg font-medium text-primary hover:text-coral bg-primary/10 hover:bg-coral/10 px-5 py-3 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Auction
        </Link>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Image & Details */}
          <div>
            {/* Image Gallery */}
            <div className="card overflow-hidden mb-6">
              <div className="aspect-[4/3] bg-gray-100 relative">
                {item.photos.length > 0 ? (
                  <>
                    <Image
                      src={item.photos[currentPhotoIndex]}
                      alt={`${item.title} - Photo ${currentPhotoIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Navigation arrows - only show if multiple photos */}
                    {item.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* Photo counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                          {currentPhotoIndex + 1} / {item.photos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gavel className="w-20 h-20 text-text-muted opacity-30" />
                  </div>
                )}
                
                {item.isFeatured && (
                  <div className="absolute top-4 left-4 bg-gold text-white text-sm font-semibold px-3 py-1 rounded">
                    Featured
                  </div>
                )}
              </div>
              
              {/* Thumbnail strip - only show if multiple photos */}
              {item.photos.length > 1 && (
                <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
                  {item.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                        currentPhotoIndex === index 
                          ? "border-coral ring-2 ring-coral/30" 
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-text mb-4">Description</h2>
              <div className="text-text-muted whitespace-pre-line">
                {item.description}
              </div>
              
              <div className="border-t mt-6 pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <User className="w-4 h-4" />
                  <span>Donated by: <strong className="text-text">{item.donor}</strong></span>
                </div>
                <p className="text-sm text-text-muted mt-1">
                  Estimated value: ${item.estimatedValue}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Bidding */}
          <div>
            <div className="card p-6 sticky top-[120px]">
              {/* Category */}
              <div className="text-sm text-primary font-semibold uppercase mb-2">
                {item.category.replace("_", " ")}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-text mb-4">
                {item.title}
              </h1>

              {/* Time Remaining */}
              <div className="flex items-center gap-2 text-text-muted mb-6">
                <Clock className="w-5 h-5" />
                <span>Ends in: <strong className="text-text">{item.endsIn}</strong></span>
              </div>

              {/* Current Bid */}
              <div className="bg-cream rounded-lg p-4 mb-6">
                <p className="text-sm text-text-muted mb-1">Current Bid</p>
                <p className="text-4xl font-bold text-primary">${item.currentBid}</p>
                <p className="text-sm text-text-muted">{item.bids.length} bids</p>
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
                      step={item.minIncrement}
                      className="input pl-10"
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
                  Minimum increment: ${item.minIncrement}
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
              {item.buyNowPrice && (
                <div className="border-t pt-4 mb-4">
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-text text-white py-3 rounded-lg font-semibold hover:bg-text/90 transition-colors"
                  >
                    Buy Now for ${item.buyNowPrice}
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
                  {item.bids.map((bid, index) => (
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
