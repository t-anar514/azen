"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface DriverDocUploadFieldProps {
  label: string
  docType: string
  value?: string | null
  onChange: (url: string) => void
}

// Like admin/ImageUploadField, but signs through /api/driver/upload-sign
// (open to any logged-in user, not just admins) and stores into that user's
// own azen/drivers/<uid> Cloudinary folder.
export function DriverDocUploadField({ label, docType, value, onChange }: DriverDocUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const signRes = await fetch("/api/driver/upload-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType }),
      })

      if (!signRes.ok) throw new Error("Could not get an upload signature. Are you logged in?")

      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("folder", folder)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      })
      const uploadJson = await uploadRes.json()

      if (!uploadRes.ok) throw new Error(uploadJson?.error?.message || "Upload failed.")

      onChange(uploadJson.secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <p className="text-sm text-[#227c70]">✓ Хуулагдсан</p>
      ) : (
        <p className="text-sm text-gray-500">Хараахан хуулаагүй</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id={`driver-doc-${docType}`}
      />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? "Хуулж байна…" : value ? "Дахин хуулах" : "Зураг хуулах"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
