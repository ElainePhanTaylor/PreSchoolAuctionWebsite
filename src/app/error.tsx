"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-pearl flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">😕</p>
        <h1 className="text-2xl font-bold text-midnight mb-2">Something Went Wrong</h1>
        <p className="text-slate mb-8">
          We hit an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
