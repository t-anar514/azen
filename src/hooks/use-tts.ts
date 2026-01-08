"use client"

import { useState, useCallback } from "react"
import { synthesizeSpeech } from "@/services/tts-service"

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(async (text: string) => {
    if (isSpeaking) return;
    
    setIsSpeaking(true)
    try {
      await synthesizeSpeech(text)
    } catch (error) {
      console.error("TTS Error:", error)
    } finally {
      setIsSpeaking(false)
    }
  }, [isSpeaking])

  return { speak, isSpeaking }
}
