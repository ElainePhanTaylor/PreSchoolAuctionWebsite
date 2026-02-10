import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary - use empty strings as fallback during build
// The actual calls will fail at runtime without proper env vars, but build will pass
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "placeholder",
  api_key: process.env.CLOUDINARY_API_KEY || "placeholder",
  api_secret: process.env.CLOUDINARY_API_SECRET || "placeholder",
})

export { cloudinary }

// Helper to upload a base64 image and return the URL
export async function uploadImage(base64Data: string): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.")
  }
  
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: "auction-items",
    transformation: [
      { width: 800, height: 600, crop: "limit" }, // Max dimensions
      { quality: "auto:good" }, // Auto optimize quality
      { fetch_format: "auto" }, // Auto format (webp, etc.)
    ],
  })
  return result.secure_url
}

// Upload multiple images
export async function uploadImages(base64Images: string[]): Promise<string[]> {
  const uploadPromises = base64Images.map((img) => uploadImage(img))
  return Promise.all(uploadPromises)
}
