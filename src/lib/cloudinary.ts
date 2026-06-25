import "server-only"
import { v2 as cloudinary } from "cloudinary"

// SERVER-ONLY. Configures the Cloudinary Node SDK using the API secret, which
// must never reach the browser. Falls back to placeholder values so the app
// builds/runs before real Cloudinary credentials are added.
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "placeholder-cloud",
  api_key: process.env.CLOUDINARY_API_KEY || "placeholder-api-key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "placeholder-api-secret",
})

export { cloudinary }
