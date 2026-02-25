"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-coral mx-auto mb-4" />
        <h2 className="text-xl font-bold text-midnight mb-2">Invalid Reset Link</h2>
        <p className="text-slate mb-6">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="btn-primary inline-block">
          Request New Link
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-midnight mb-2">Password Reset!</h2>
        <p className="text-slate mb-6">Your password has been updated. You can now log in with your new password.</p>
        <Link href="/login" className="btn-primary inline-block">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8">
      {error && (
        <div className="bg-coral/10 border border-coral/20 text-coral px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-midnight mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input !pl-12"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-midnight mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input !pl-12"
              placeholder="Confirm your new password"
              required
            />
          </div>
          {password && confirmPassword && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              {password === confirmPassword ? (
                <>
                  <CheckCircle className="w-4 h-4 text-teal" />
                  <span className="text-teal font-medium">Passwords match</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-coral" />
                  <span className="text-coral font-medium">Passwords don&apos;t match</span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      <div className="p-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate hover:text-midnight font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/IMG_7446.jpeg"
                alt="San Anselmo Cooperative Nursery School"
                width={180}
                height={70}
                className="h-16 w-auto object-contain mx-auto"
              />
            </Link>
            <h1 className="text-3xl font-extrabold text-midnight mb-2">Set new password</h1>
            <p className="text-slate">Choose a strong password</p>
          </div>

          <Suspense fallback={<div className="card p-8 text-center text-slate">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
