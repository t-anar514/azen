"use client"

import { useState, useEffect, useCallback } from "react"

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices()
      // Try to find a Japanese voice
      const jaVoice = voices.find(v => v.lang.includes("ja") || v.lang.includes("JP"))
      if (jaVoice) {
        setVoice(jaVoice)
      } else {
        // Fallback or just pick the first one if really necessary, 
        // but for Japanese learning, we really want a Japanese voice.
        console.warn("No Japanese voice found. TTS might sound incorrect.")
      }
    }

    // Initial fetch
    handleVoicesChanged()

    // Event listener for when voices are loaded/changed
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!voice) {
        // Try one last time to get voices if they loaded late
        const voices = window.speechSynthesis.getVoices()
        const jaVoice = voices.find(v => v.lang.includes("ja") || v.lang.includes("JP"))
        if (!jaVoice) {
            console.error("Cannot speak: No Japanese voice available.")
            return
        }
    }

    // Cancel any current speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    // If we have a voice securely identified (either from state or JIT check), use it.
    // Re-finding here to be safe if closure captured null initial state but voices array is now populated
    const currentVoices = window.speechSynthesis.getVoices()
    const currentJaVoice = currentVoices.find(v => v.lang.includes("ja") || v.lang.includes("JP"))
    
    if (currentJaVoice) {
         utterance.voice = currentJaVoice
    }

    utterance.lang = "ja-JP"
    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (e) => {
      console.error("TTS Error:", e)
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }, [voice])

  return { speak, isSpeaking }
}
