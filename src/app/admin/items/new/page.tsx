"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, Upload, X, Loader2, CheckCircle, AlertCircle
} from "lucide-react"

const CATEGORIES = [
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

export default function AddItemPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [estimatedValue, setEstimatedValue] = useState("")
  const [startingBid, setStartingBid] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Auth check
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet" />
      </div>
    )
  }

  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin
  if (!session || !isAdmin) {
    router.push("/login")
    return null
  }

  const addPhotoUrl = () => {
    if (newPhotoUrl && !photoUrls.includes(newPhotoUrl)) {
      setPhotoUrls([...photoUrls, newPhotoUrl])
      setNewPhotoUrl("")
    }
  }

  const removePhoto = (url: string) => {
    setPhotoUrls(photoUrls.filter(p => p !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      // Validate
      if (!title || !description || !category) {
        throw new Error("Title, description, and category are required")
      }
      if (photoUrls.length === 0) {
        throw new Error("At least one photo is required")
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
          startingBid: startingBid ? parseFloat(startingBid) : null,
          isFeatured,
          photos: photoUrls,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create item")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-midnight mb-2">Item Created!</h1>
          <p className="text-slate">Redirecting to admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate hover:text-violet transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-midnight">Add Auction Item</h1>
          </div>
          <span className="badge badge-violet">Admin</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-coral/10 border border-coral/20 text-coral px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-bold text-midnight">Item Details</h2>
            
            <div>
              <label className="block text-sm font-semibold text-midnight mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g., Wine Country Weekend Getaway"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-midnight mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input resize-none"
                rows={5}
                placeholder="Describe the item in detail..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-midnight mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-midnight mb-2">
                  Estimated Value ($)
                </label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="input"
                  placeholder="e.g., 500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-midnight mb-2">
                  Starting Bid ($)
                </label>
                <input
                  type="number"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  className="input"
                  placeholder="Leave blank to auto-calculate (50% of value)"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-silver mt-1">
                  If blank, will be set to 50% of estimated value or $25
                </p>
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-light text-violet focus:ring-violet"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-midnight">
                  Featured Item (highlighted on homepage)
                </label>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-bold text-midnight">Photos</h2>
            <p className="text-sm text-slate">
              Add photo URLs. For now, upload images to a service like Imgur or Cloudinary and paste the URL here.
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="input flex-1"
                placeholder="https://example.com/photo.jpg"
              />
              <button
                type="button"
                onClick={addPhotoUrl}
                className="btn-primary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Add
              </button>
            </div>

            {photoUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden group">
                    {/* Using img tag for preview to allow any domain */}
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 badge badge-violet text-xs">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {photoUrls.length === 0 && (
              <div className="border-2 border-dashed border-slate-light/30 rounded-xl p-8 text-center">
                <Upload className="w-8 h-8 text-silver mx-auto mb-2" />
                <p className="text-slate">No photos added yet</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/admin" className="btn-outline flex-1 text-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-coral flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Item"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
