// Resolves the voice list, waiting briefly for the async "voiceschanged"
// event if the browser hasn't populated it yet (common on first call —
// Chrome loads voices asynchronously and getVoices() can return []).
function getVoicesAsync(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const existing = synth.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const onVoicesChanged = () => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", onVoicesChanged);
    // Some browsers never fire voiceschanged — don't hang forever.
    setTimeout(() => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(synth.getVoices());
    }, 300);
  });
}

/**
 * Uses the browser's native SpeechSynthesis API to read text. This is only a
 * fallback for phrases that don't have a cached VOICEVOX recording yet (see
 * playAudioUrl) — quality depends entirely on whatever Japanese voice the
 * OS/browser ships, which is often noticeably more robotic.
 */
export const synthesizeSpeech = (text: string, voiceName?: string): Promise<{ success: boolean; error?: unknown }> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech Synthesis not supported in this environment.");
      return resolve({ success: false, error: "Not supported" });
    }

    const synth = window.speechSynthesis;

    const doSpeak = async () => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Set language to Japanese
      utterance.lang = "ja-JP";
      utterance.rate = 0.9; // Slightly slower for better learning
      utterance.pitch = 1.0;

      // Try to find a high-quality Japanese voice if requested or available
      const voices = await getVoicesAsync(synth);
      if (voiceName) {
        const selectedVoice = voices.find(v => v.name === voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;
      } else {
        // Prefer "Google 日本語" or "Kyoko" or any Japanese voice
        const jaVoice = voices.find(v => v.lang === "ja-JP" || v.lang === "ja_JP");
        if (jaVoice) utterance.voice = jaVoice;
      }

      if (!utterance.voice && voices.length > 0) {
        // No ja-JP voice installed at all — speechSynthesis will likely
        // error or silently use an unrelated default voice. Surface this
        // clearly instead of letting it fail with no explanation.
        console.warn(
          "No Japanese voice found on this device; speech may fail or sound wrong.",
          voices.map(v => v.lang)
        );
      }

      utterance.onend = () => {
        resolve({ success: true });
      };

      utterance.onerror = (event) => {
        // SpeechSynthesisErrorEvent's useful info lives on `.error` (a string
        // reason like "canceled"/"interrupted"/"synthesis-failed"), not on
        // the event's own enumerable properties — logging the bare event
        // prints "{}" in the console/Next's overlay, which looks like there's
        // no information even though there usually is.
        const reason = event.error || event;

        // "canceled"/"interrupted" just mean a newer speak() call (e.g. the
        // user tapping another vowel/phrase button quickly) preempted this
        // one — that's expected behavior, not a real failure, so don't log
        // it as a console.error (Next's dev overlay turns those into a red
        // error screen for what is normal interaction).
        if (reason === "canceled" || reason === "interrupted") {
          resolve({ success: false, error: reason });
          return;
        }

        console.error("SpeechSynthesis error:", reason);
        resolve({ success: false, error: reason });
      };

      synth.speak(utterance);
    };

    // Chrome has a long-standing bug where speak() called immediately after
    // cancel() in the same tick silently fails (onerror fires with an empty
    // reason). Only cancel if something's actually in progress, and defer
    // the new speak() to the next tick so it doesn't race the cancellation.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(doSpeak, 50);
    } else {
      doSpeak();
    }
  });
};

/**
 * Plays a pre-generated audio file (a cached VOICEVOX recording stored in
 * Cloudinary, created once via the admin "Phrases" form) through a plain
 * <audio> element. Preferred over synthesizeSpeech whenever a phrase already
 * has cached audio — this is what replaces the robotic browser voice with a
 * natural one for phrasebook playback.
 *
 * `audioRef`, if given, is set to the live Audio instance so a caller (e.g.
 * useTTS's `stop()`) can pause it early.
 */
export const playAudioUrl = (
  url: string,
  audioRef?: { current: HTMLAudioElement | null }
): Promise<{ success: boolean; error?: unknown }> => {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    if (audioRef) audioRef.current = audio;

    audio.onended = () => resolve({ success: true });
    audio.onerror = (event) => resolve({ success: false, error: event });

    audio.play().catch((error) => resolve({ success: false, error }));
  });
};

