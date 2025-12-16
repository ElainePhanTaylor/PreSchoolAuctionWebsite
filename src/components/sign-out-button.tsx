"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  )
}

