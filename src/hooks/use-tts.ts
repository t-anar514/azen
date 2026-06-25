"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { synthesizeSpeech, playAudioUrl } from "@/services/tts-service"

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => stop()
  }, [stop])

  // `audioUrl`, when present, is a pre-generated VOICEVOX recording (see
  // PhraseCard) — it sounds natural, unlike the browser's speechSynthesis,
  // which is kept only as a fallback for phrases that don't have cached
  // audio yet (or if that cached file fails to play).
  const speak = useCallback(async (text: string, audioUrl?: string | null) => {
    if (isSpeaking) stop()

    setIsSpeaking(true)
    try {
      if (audioUrl) {
        const { success } = await playAudioUrl(audioUrl, audioRef)
        if (success) return
        console.warn("Cached audio playback failed, falling back to browser TTS.")
      }
      await synthesizeSpeech(text)
    } catch (error) {
      console.error("TTS Error:", error)
    } finally {
      setIsSpeaking(false)
    }
  }, [isSpeaking, stop])

  return { speak, stop, isSpeaking }
}
