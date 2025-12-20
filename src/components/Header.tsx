"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { User, LogOut, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function Header() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Logo goes to dashboard if logged in, home if not
  const logoHref = session ? "/dashboard" : "/"

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
        <Link href={logoHref} className="flex items-center gap-3">
          <Image 
            src="/images/IMG_7446.jpeg" 
            alt="SACNS" 
            width={120} 
            height={48} 
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/auction" className="text-text-muted hover:text-primary font-medium transition-colors">
            Browse Auction
          </Link>
          {session && (
            <Link href="/dashboard" className="text-text-muted hover:text-primary font-medium transition-colors">
              My Dashboard
            </Link>
          )}
          {(session?.user as any)?.isAdmin && (
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
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-text hover:bg-cream transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  My Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
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

