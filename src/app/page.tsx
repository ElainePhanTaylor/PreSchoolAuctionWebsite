"use client"

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Sparkles, Heart, Gavel, Users, ArrowRight, Clock, TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen gradient-mesh overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="card-glass px-6 py-3 flex items-center justify-between">
            <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2">
              <Image
                src="/images/IMG_7446.jpeg" 
                alt="San Anselmo Cooperative Nursery School" 
                width={140}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-10">
              <Link href="/auction" className="text-2xl text-slate font-semibold hover:text-midnight transition-colors">
                Browse
              </Link>
              <Link href="#how-it-works" className="text-2xl text-slate font-semibold hover:text-midnight transition-colors">
                How It Works
              </Link>
            </nav>
            {session ? (
              <div className="hidden md:flex items-center gap-5">
                <Link href="/dashboard" className="btn-primary text-xl px-8 py-4">
                  My Dashboard
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-5">
                <Link href="/login" className="text-2xl text-midnight font-semibold hover:text-violet transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="btn-primary text-xl px-8 py-4">
                  Get Started
                </Link>
              </div>
            )}
            {!session && (
              <Link href="/login" className="md:hidden text-sm font-semibold text-midnight hover:text-violet transition-colors">
                Log In
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-midnight" />
              ) : (
                <Menu className="w-6 h-6 text-midnight" />
              )}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-white/95 backdrop-blur-sm rounded-xl p-4 space-y-2">
              <Link href="/auction" className="block px-4 py-3 rounded-lg text-midnight font-semibold hover:bg-pearl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Browse Auction
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="block px-4 py-3 rounded-lg text-midnight font-semibold hover:bg-pearl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-4 py-3 rounded-lg text-midnight font-semibold hover:bg-pearl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                  <Link href="/register" className="block px-4 py-3 rounded-lg text-center btn-primary" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="badge badge-violet mb-6">
                <Sparkles className="w-3 h-3" />
                Fundraising Made Fun
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-midnight leading-[1.1] mb-6">
                Bid for a
                <span className="block bg-gradient-to-r from-violet via-coral to-teal bg-clip-text text-transparent">
                  Brighter Future
                </span>
              </h1>
              
              <p className="text-xl text-slate mb-8 leading-relaxed max-w-lg">
                Join our community auction supporting San Anselmo Cooperative Nursery School. 
                Discover unique items, place your bids, and make a difference.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/register" className="btn-coral inline-flex items-center justify-center gap-2">
                  Start Bidding
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/auction" className="btn-outline inline-flex items-center justify-center gap-2">
                  Explore Items
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-3xl font-extrabold text-midnight">50+</p>
                  <p className="text-silver text-sm font-medium">Unique Items</p>
                </div>
                <div className="w-px h-12 bg-slate-light/20"></div>
                <div>
                  <p className="text-3xl font-extrabold text-midnight">$12K</p>
                  <p className="text-silver text-sm font-medium">Raised Last Year</p>
                </div>
                <div className="w-px h-12 bg-slate-light/20"></div>
                <div>
                  <p className="text-3xl font-extrabold text-midnight">75</p>
                  <p className="text-silver text-sm font-medium">Years Strong</p>
                </div>
              </div>
            </div>

            {/* Right: Featured Cards with Redwood Background */}
            <div className="relative hidden lg:block">
              {/* Redwood Background Image */}
              <div className="absolute inset-0 -inset-x-8 -inset-y-8 overflow-hidden rounded-3xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/images/redwood.png')",
                  }}
                />
                {/* Blur and gradient overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-white/60 via-white/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-pearl/80 via-transparent to-pearl/60" />
              </div>

              {/* Floating Cards */}
              <div className="relative h-[500px] z-10">
                {/* Card 1 */}
                <div className="card absolute top-0 right-0 w-72 p-4 animate-float shadow-xl" style={{ animationDelay: '0s' }}>
                  <div className="aspect-[4/3] rounded-xl mb-3 overflow-hidden">
                    <Image src="/images/wine.png" alt="Wine Country Getaway" width={300} height={225} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-midnight">Wine Country Getaway</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-extrabold text-coral">$450</span>
                    <span className="text-silver text-sm">8 bids</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="card absolute top-32 left-0 w-64 p-4 animate-float shadow-xl" style={{ animationDelay: '0.5s' }}>
                  <div className="aspect-[4/3] rounded-xl mb-3 overflow-hidden">
                    <Image src="/images/artclass.png" alt="Art Class Bundle" width={300} height={225} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-midnight">Art Class Bundle</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-extrabold text-coral">$180</span>
                    <span className="text-silver text-sm">5 bids</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="card absolute bottom-0 right-12 w-60 p-4 animate-float shadow-xl" style={{ animationDelay: '1s' }}>
                  <div className="aspect-[4/3] rounded-xl mb-3 overflow-hidden">
                    <Image src="/images/giftcards.png" alt="Gift Card Bundle" width={300} height={225} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-midnight">Gift Card Bundle</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-extrabold text-coral">$120</span>
                    <span className="text-silver text-sm">3 bids</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-coral mb-4 mx-auto">Simple Process</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-midnight mb-4">
              How It Works
            </h2>
            <p className="text-slate text-lg max-w-2xl mx-auto">
              Participating is easy. Sign up, find items you love, and bid to win!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Create Account",
                description: "Sign up in seconds with your email. It's free to join!",
                color: "from-violet to-indigo-500",
              },
              {
                icon: Gavel,
                title: "Place Bids",
                description: "Browse items, add to watchlist, and place competitive bids.",
                color: "from-coral to-orange-500",
              },
              {
                icon: Heart,
                title: "Make Impact",
                description: "Win amazing items while supporting our school community.",
                color: "from-teal to-cyan-500",
              },
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-midnight mb-2">{step.title}</h3>
                <p className="text-slate">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Auction Preview */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div>
              <div className="badge badge-teal mb-4">
                <Clock className="w-3 h-3" />
                Live Now
              </div>
              <h2 className="text-4xl font-extrabold text-midnight">
                Trending Items
              </h2>
            </div>
            <Link href="/auction" className="btn-secondary inline-flex items-center gap-2">
              View All Items
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { image: "/images/beachhouse.png", title: "Beach House Weekend", price: 650, bids: 12, category: "Experiences" },
              { image: "/images/pizza.png", title: "Pizza Party Package", price: 85, bids: 6, category: "Food & Dining" },
              { image: "/images/spa.png", title: "Spa Day for Two", price: 320, bids: 9, category: "Services" },
            ].map((item, index) => (
              <Link href={`/auction/${index + 1}`} key={index} className="card p-5 group cursor-pointer">
                <div className="aspect-[4/3] rounded-xl mb-4 overflow-hidden group-hover:scale-[1.02] transition-transform">
                  <Image src={item.image} alt={item.title} width={400} height={300} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-violet">{item.category}</span>
                </div>
                <h3 className="text-lg font-bold text-midnight mb-3">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-silver">Current Bid</p>
                    <p className="text-2xl font-extrabold text-midnight">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-1 text-silver">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.bids} bids</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-midnight py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="bg-white rounded-xl p-3">
            <Image
                src="/images/IMG_7446.jpeg" 
                alt="San Anselmo Cooperative Nursery School" 
                width={200}
                height={80}
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="text-silver text-sm text-center md:text-right">
              <p className="font-medium text-white mb-1">San Anselmo Cooperative Nursery School</p>
              <p>24 Myrtle Lane, San Anselmo, CA 94960</p>
              <p>(415) 454-5308</p>
            </div>
          </div>
          <div className="border-t border-slate-light/20 mt-8 pt-8 text-center text-slate-light text-sm">
            © {new Date().getFullYear()} San Anselmo Cooperative Nursery School. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
