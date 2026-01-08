// Define your new hosted configuration
const VOICEVOX_API_KEY = "fadcfce212c0c616fb1851ab9bcfb0774ee2100f527198f7a35f83ae1227fd93";
const HOSTED_VOICEVOX_URL = "https://deprecatedapis.tts.quest/v2/voicevox/audio/";

export const synthesizeSpeech = async (text: string, speakerId: number = 1) => {
  try {
    // 1. Construct the URL with required parameters
    const encodedText = encodeURIComponent(text);
    const url = `${HOSTED_VOICEVOX_URL}?key=${VOICEVOX_API_KEY}&speaker=${speakerId}&text=${encodedText}`;

    // 2. Simply play the audio via the browser's Audio element
    // This bypasses complex fetch/blob logic and works instantly
    const audio = new Audio(url);
    await audio.play();
    
    return { success: true };
  } catch (error) {
    console.error("Hosted TTS failed:", error);
    return { success: false, error };
  }
};
