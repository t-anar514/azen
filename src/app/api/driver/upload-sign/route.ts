import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cloudinary } from "@/lib/cloudinary"

// Issues a short-lived signature for a direct browser -> Cloudinary upload,
// scoped to the requesting user's own folder. Unlike /api/cloudinary/sign
// (admin-only, used by the content dashboards), this just requires being
// logged in — any user applying to drive needs to upload their license/ID/
// vehicle documents before they're a "driver" in any sense.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const docType = typeof body.docType === "string" ? body.docType.replace(/[^a-z_]/g, "") : "document"
  const folder = `azen/drivers/${user.id}`

  const timestamp = Math.round(Date.now() / 1000)
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "placeholder-api-secret"

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret)

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    docType,
    apiKey: process.env.CLOUDINARY_API_KEY || "placeholder-api-key",
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "placeholder-cloud",
  })
}
