"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Upload, X, Image as ImageIcon, 
  ChevronDown, AlertCircle, CheckCircle, ArrowLeft, Loader2
} from "lucide-react"
import Header from "@/components/Header"

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
    donorName: "",
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Redirect if not logged in
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet" />
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
    setError("")
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newUrls = photoPreviewUrls.filter((_, i) => i !== index)
    
    // Revoke the URL to prevent memory leak
    URL.revokeObjectURL(photoPreviewUrls[index])
    
    setPhotos(newPhotos)
    setPhotoPreviewUrls(newUrls)
  }

  // Compress and convert file to base64
  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img')
      const canvas = document.createElement('canvas')
      const reader = new FileReader()

      reader.onload = (e) => {
        img.onload = () => {
          // Calculate new dimensions (max 800px to stay under Cloudinary 10MB limit)
          let { width, height } = img
          const maxSize = 800

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Convert to JPEG at 70% quality (keeps file under 10MB)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
          resolve(compressedBase64)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
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
      // Step 1: Compress and upload photos to Cloudinary
      setUploadingPhotos(true)
      const base64Images = await Promise.all(photos.map(compressAndConvertToBase64))
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: base64Images }),
      })

      if (!uploadRes.ok) {
        const data = await uploadRes.json()
        throw new Error(data.error || "Failed to upload images")
      }

      const { urls: photoUrls } = await uploadRes.json()
      setUploadingPhotos(false)

      // Step 2: Create the donation item (pending approval)
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
          donorName: formData.donorName,
          photos: photoUrls,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit donation")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
      setUploadingPhotos(false)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-pearl flex flex-col">
        <Header />

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="card max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-midnight mb-2">Thank You!</h1>
            <p className="text-slate mb-6">
              Your donation has been submitted for review. We&apos;ll notify you once it&apos;s approved and live in the auction.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setSuccess(false)
                  setFormData({ title: "", description: "", category: "", estimatedValue: "", donorName: "" })
                  setPhotos([])
                  setPhotoPreviewUrls([])
                }}
                className="btn-primary w-full"
              >
                Donate Another Item
              </button>
              <Link href="/dashboard" className="btn-outline w-full block text-center">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pearl">
      <Header />

      {/* Back Link */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-slate hover:text-violet transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 pb-12">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-midnight mb-2">Donate an Item</h1>
          <p className="text-slate mb-8">
            Thank you for contributing to our auction! Please provide details about your donation.
          </p>

          {error && (
            <div className="bg-coral/10 border border-coral/20 text-coral px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-midnight mb-2">
                Photos <span className="text-coral">*</span>
              </label>
              <p className="text-sm text-slate mb-3">
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
                      <div className="absolute bottom-0 left-0 right-0 bg-violet text-white text-xs text-center py-1">
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
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-slate hover:border-violet hover:text-violet transition-colors"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add Photo</span>
                  </button>
                )}
              </div>

              {photos.length === 0 && (
                <div className="mt-3 border-2 border-dashed border-slate-light/30 rounded-xl p-6 text-center">
                  <ImageIcon className="w-10 h-10 text-silver mx-auto mb-2" />
                  <p className="text-slate text-sm">No photos added yet</p>
                </div>
              )}

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
              <label htmlFor="title" className="block text-sm font-medium text-midnight mb-2">
                Item Title <span className="text-coral">*</span>
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

            {/* Donor Name */}
            <div>
              <label htmlFor="donorName" className="block text-sm font-medium text-midnight mb-2">
                Donated By <span className="text-coral">*</span>
              </label>
              <input
                id="donorName"
                name="donorName"
                type="text"
                value={formData.donorName}
                onChange={handleChange}
                className="input"
                placeholder="e.g., The Smith Family, Jane Doe, Local Business Name"
                required
              />
              <p className="text-xs text-slate mt-1">
                This name will be displayed on the auction item.
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-midnight mb-2">
                Category <span className="text-coral">*</span>
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-midnight mb-2">
                Description <span className="text-coral">*</span>
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
              <label htmlFor="estimatedValue" className="block text-sm font-medium text-midnight mb-2">
                Estimated Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate">$</span>
                <input
                  id="estimatedValue"
                  name="estimatedValue"
                  type="number"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  className="input pl-8"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
              <p className="text-xs text-slate mt-1">
                This helps us set an appropriate starting bid.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-coral w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadingPhotos ? "Uploading photos..." : "Submitting..."}
                </>
              ) : (
                "Submit Donation"
              )}
            </button>

            <p className="text-xs text-slate text-center">
              Your donation will be reviewed by our team before appearing in the auction.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
