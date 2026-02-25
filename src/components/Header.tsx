"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { User, LogOut, ChevronDown, Menu, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function Header() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const logoHref = session ? "/dashboard" : "/"
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/auction" className="text-slate hover:text-violet font-medium transition-colors">
            Browse Auction
          </Link>
          {session && (
            <Link href="/dashboard" className="text-slate hover:text-violet font-medium transition-colors">
              My Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-violet font-medium transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop user menu */}
          {session ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-pearl hover:bg-violet/10 px-4 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet to-coral rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-midnight font-medium hidden lg:block">
                  {session.user?.name || "User"}
                </span>
                <ChevronDown className="w-4 h-4 text-silver" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-silver">Signed in as</p>
                    <p className="text-sm font-semibold text-midnight truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-midnight hover:bg-pearl transition-colors"
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
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-slate hover:text-violet font-medium transition-colors">
                Log In
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-5">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-pearl transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-midnight" />
            ) : (
              <Menu className="w-6 h-6 text-midnight" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] z-40">
          <div
            className="absolute inset-0 bg-midnight/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="relative bg-white border-t border-gray-100 shadow-xl">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/auction"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-midnight font-medium hover:bg-pearl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Auction
              </Link>
              {session && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-midnight font-medium hover:bg-pearl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-violet font-medium hover:bg-violet/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>

            <div className="border-t border-gray-100 px-4 py-3">
              {session ? (
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-sm text-silver">Signed in as</p>
                    <p className="text-sm font-semibold text-midnight">{session.user?.email}</p>
                  </div>
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setMobileMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block text-center px-4 py-3 rounded-xl text-midnight font-medium hover:bg-pearl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="block text-center btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
