import "server-only"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"
import { cloudinary } from "@/lib/cloudinary"

// Generates a natural-sounding Japanese voice clip for a phrase using
// VOICEVOX (hosted by tts.quest, via the existing TTS_QUEST_KEY env var),
// then hands the result off to Cloudinary for permanent storage. Triggered
// once per phrase from the admin "Phrases" form — the public /learn page
// just plays back the stored audio_url, so this never runs on page view.
const TTS_QUEST_SYNTHESIS_URL = "https://api.tts.quest/v3/voicevox/synthesis"

// Speaker 30 = "VOICEVOX:No.7（アナウンス）" — a clear, neutral announcer
// voice, a good fit for travel-phrase pronunciation. Override via env if a
// different VOICEVOX speaker is preferred (see
// https://static.tts.quest/voicevox_speakers_utf8.json for the full list,
// indexed from 0 = speaker id).
const DEFAULT_SPEAKER_ID = process.env.VOICEVOX_SPEAKER_ID || "30"

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error

  const body = await request.json().catch(() => null)
  const text = typeof body?.text === "string" ? body.text.trim() : ""
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 })
  }

  try {
    const synthesisUrl = new URL(TTS_QUEST_SYNTHESIS_URL)
    synthesisUrl.searchParams.set("speaker", DEFAULT_SPEAKER_ID)
    synthesisUrl.searchParams.set("text", text)
    const apiKey = process.env.TTS_QUEST_KEY
    if (apiKey) synthesisUrl.searchParams.set("key", apiKey)

    const synthesisRes = await fetch(synthesisUrl.toString())
    const synthesisJson = await synthesisRes.json().catch(() => null)

    if (!synthesisJson?.success || !synthesisJson?.mp3DownloadUrl) {
      return NextResponse.json(
        { error: synthesisJson?.errorMessage || "VOICEVOX synthesis request failed." },
        { status: 502 }
      )
    }

    const mp3DownloadUrl = synthesisJson.mp3DownloadUrl as string

    // mp3DownloadUrl 404s until synthesis finishes — poll briefly until ready.
    const ready = await waitUntilReady(mp3DownloadUrl)
    if (!ready) {
      return NextResponse.json(
        { error: "VOICEVOX audio didn't finish synthesizing in time. Try again." },
        { status: 504 }
      )
    }

    const upload = await cloudinary.uploader.upload(mp3DownloadUrl, {
      resource_type: "video", // Cloudinary stores audio under the "video" resource type.
      folder: "azen/learn/audio",
    })

    return NextResponse.json({ url: upload.secure_url })
  } catch (error) {
    console.error("Audio generation failed:", error)
    return NextResponse.json({ error: "Audio generation failed." }, { status: 500 })
  }
}

async function waitUntilReady(url: string, attempts = 15, delayMs = 700): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, { cache: "no-store" }).catch(() => null)
    if (res?.ok) return true
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return false
}
