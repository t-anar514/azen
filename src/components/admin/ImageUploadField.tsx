"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ImageUploadFieldProps {
  label?: string
  folder?: string
  value?: string | null
  onChange: (url: string, publicId: string) => void
  className?: string
}

// Admin-only image field: uploads straight from the browser to Cloudinary
// using a short-lived signature from /api/cloudinary/sign, so large files
// never pass through the Next.js server. Only the resulting secure_url +
// public_id get saved to the database by the caller.
export function ImageUploadField({
  label = "Image",
  folder = "azen",
  value,
  onChange,
  className,
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      })

      if (!signRes.ok) {
        throw new Error("Could not get an upload signature. Are you logged in as an admin?")
      }

      const { signature, timestamp, apiKey, cloudName, folder: signedFolder } =
        await signRes.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("folder", signedFolder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      )

      const uploadJson = await uploadRes.json()

      if (!uploadRes.ok) {
        throw new Error(uploadJson?.error?.message || "Upload to Cloudinary failed.")
      }

      onChange(uploadJson.secure_url, uploadJson.public_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Current upload"
          className="h-32 w-full rounded-md border object-cover"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`image-upload-${label}`}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
