"use client"

import { useState, useCallback, useEffect } from "react"
import { synthesizeSpeech } from "@/services/tts-service"

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback(async (text: string) => {
    if (isSpeaking) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
    
    setIsSpeaking(true)
    try {
      await synthesizeSpeech(text)
    } catch (error) {
      console.error("TTS Error:", error)
    } finally {
      setIsSpeaking(false)
    }
  }, [isSpeaking])

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return { speak, stop, isSpeaking }
}

