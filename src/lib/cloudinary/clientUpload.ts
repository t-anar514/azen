// Client-side signed upload to Cloudinary — mirrors ImageUploadField's
// sign → upload sequence (src/components/admin/ImageUploadField.tsx) as a
// plain function so every Studio image field (recommendation photos, post
// cover, profile avatar/cover) shares one implementation instead of each
// form re-deriving it.
export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  })
  if (!signRes.ok) throw new Error("Зураг оруулах эрх аваагүй байна.")
  const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await signRes.json()

  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", apiKey)
  formData.append("timestamp", String(timestamp))
  formData.append("signature", signature)
  formData.append("folder", signedFolder)

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })
  const json = await uploadRes.json()
  if (!uploadRes.ok) throw new Error(json?.error?.message || "Зураг байршуулахад алдаа гарлаа.")
  return json.secure_url as string
}
