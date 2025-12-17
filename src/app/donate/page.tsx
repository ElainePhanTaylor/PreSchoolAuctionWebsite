"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Trees, Upload, X, Image as ImageIcon, 
  ChevronDown, AlertCircle, CheckCircle, ArrowLeft
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

export default function DonatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    estimatedValue: "",
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Redirect if not logged in
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen redwood-bg flex items-center justify-center">
        <Trees className="w-12 h-12 text-primary animate-pulse" />
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photos.length > 5) {
      setError("Maximum 5 photos allowed")
      return
    }

    const newPhotos = [...photos, ...files]
    setPhotos(newPhotos)

    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file))
    setPhotoPreviewUrls([...photoPreviewUrls, ...newUrls])
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newUrls = photoPreviewUrls.filter((_, i) => i !== index)
    
    // Revoke the URL to prevent memory leak
    URL.revokeObjectURL(photoPreviewUrls[index])
    
    setPhotos(newPhotos)
    setPhotoPreviewUrls(newUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (photos.length === 0) {
      setError("Please upload at least one photo")
      return
    }

    if (!formData.category) {
      setError("Please select a category")
      return
    }

    setLoading(true)

    try {
      // TODO: Upload photos and submit form
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen redwood-bg flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <Trees className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-text">SACNS Auction</span>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="card max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Thank You!</h1>
            <p className="text-text-muted mb-6">
              Your donation has been submitted for review. We&apos;ll notify you once it&apos;s approved and live in the auction.
            </p>
            <div className="space-y-3">
              <Link href="/donate" className="btn-primary w-full block" onClick={() => {
                setSuccess(false)
                setFormData({ title: "", description: "", category: "", estimatedValue: "" })
                setPhotos([])
                setPhotoPreviewUrls([])
              }}>
                Donate Another Item
              </Link>
              <Link href="/dashboard" className="btn-gold w-full block">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
          <Link href="/dashboard" className="btn-primary">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Back Link */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 pb-12">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-text mb-2">Donate an Item</h1>
          <p className="text-text-muted mb-8">
            Thank you for contributing to our auction! Please provide details about your donation.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Photos <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-text-muted mb-3">
                Upload up to 5 photos of your item. First photo will be the main image.
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Uploaded Photos */}
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs text-center py-1">
                        Main Photo
                      </div>
                    )}
                  </div>
                ))}

                {/* Upload Button */}
                {photos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add Photo</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
                Item Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Wine Country Weekend Getaway"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="input resize-none"
                placeholder="Describe your item in detail. Include any important information like expiration dates, restrictions, or special features."
                required
              />
            </div>

            {/* Estimated Value */}
            <div>
              <label htmlFor="estimatedValue" className="block text-sm font-medium text-text mb-2">
                Estimated Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                <input
                  id="estimatedValue"
                  name="estimatedValue"
                  type="number"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  className="input pl-8"
                  placeholder="0"
                  min="0"
                />
              </div>
              <p className="text-xs text-text-muted mt-1">
                This helps us set an appropriate starting bid.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Donation"}
            </button>

            <p className="text-xs text-text-muted text-center">
              Your donation will be reviewed by our team before appearing in the auction.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
