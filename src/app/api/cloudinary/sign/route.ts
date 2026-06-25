import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cloudinary } from "@/lib/cloudinary"

// Issues a short-lived signature for a direct browser -> Cloudinary upload.
// The browser never sees the API secret; it only gets back enough to perform
// one signed upload call itself. Restricted to admins, since this is only
// used from the admin dashboard's image fields.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const folder = typeof body.folder === "string" ? body.folder : "azen"

  const timestamp = Math.round(Date.now() / 1000)
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "placeholder-api-secret"

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret)

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY || "placeholder-api-key",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "placeholder-cloud",
  })
}
