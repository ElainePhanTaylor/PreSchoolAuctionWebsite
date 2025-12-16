"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Trees, User, LogOut, Settings, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function Header() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Trees className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-text">SACNS Auction</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/auction" className="text-text-muted hover:text-primary font-medium transition-colors">
            Browse Auction
          </Link>
          <Link href="/dashboard/watchlist" className="text-text-muted hover:text-primary font-medium transition-colors">
            Watchlist
          </Link>
          <Link href="/dashboard/my-bids" className="text-text-muted hover:text-primary font-medium transition-colors">
            My Bids
          </Link>
          {session?.user?.isAdmin && (
            <Link href="/admin" className="text-gold-dark hover:text-gold font-medium transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {session ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-cream hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-text font-medium hidden sm:block">
                {session.user?.name || "User"}
              </span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-text-muted">Signed in as</p>
                  <p className="text-sm font-semibold text-text truncate">
                    {session.user?.email}
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-4 py-2 text-text hover:bg-cream transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-text-muted hover:text-primary font-medium transition-colors">
              Log In
            </Link>
            <Link href="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

