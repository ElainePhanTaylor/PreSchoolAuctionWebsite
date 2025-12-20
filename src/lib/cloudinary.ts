import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Helper to upload a base64 image and return the URL
export async function uploadImage(base64Data: string): Promise<string> {
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
