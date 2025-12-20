import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadImages } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 })
    }

    const { images } = await request.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      )
    }

    if (images.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 images allowed" },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    console.log("Uploading", images.length, "images to Cloudinary...")
    const urls = await uploadImages(images)
    console.log("Upload successful:", urls)

    return NextResponse.json({ urls })
  } catch (error) {
    console.error("Upload error:", error)
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : "Failed to upload images"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
