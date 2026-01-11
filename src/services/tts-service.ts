/**
 * Uses the browser's native SpeechSynthesis API to read text.
 * This provides instant, reliable TTS without external dependencies.
 */
export const synthesizeSpeech = (text: string, voiceName?: string): Promise<{ success: boolean; error?: unknown }> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech Synthesis not supported in this environment.");
      return resolve({ success: false, error: "Not supported" });
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language to Japanese
    utterance.lang = "ja-JP";
    utterance.rate = 0.9; // Slightly slower for better learning
    utterance.pitch = 1.0;

    // Try to find a high-quality Japanese voice if requested or available
    const voices = window.speechSynthesis.getVoices();
    if (voiceName) {
      const selectedVoice = voices.find(v => v.name === voiceName);
      if (selectedVoice) utterance.voice = selectedVoice;
    } else {
      // Prefer "Google 日本語" or "Kyoko" or any Japanese voice
      const jaVoice = voices.find(v => v.lang === "ja-JP" || v.lang === "ja_JP");
      if (jaVoice) utterance.voice = jaVoice;
    }

    utterance.onend = () => {
      resolve({ success: true });
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesis error:", event);
      resolve({ success: false, error: event });
    };

    window.speechSynthesis.speak(utterance);
  });
};

