import { GoogleGenAI, Modality, Type } from "@google/genai";
import { fileToBase64, base64ToUint8Array, createWavBlob } from "../utils/audioUtils";
import { VoiceOption } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface TranslationResult {
  spanishText: string;
  originalTranscript: string;
}

/**
 * Step 1: Transcribe and Translate the audio file.
 * We use Gemini 2.5 Flash for its large context window and multimodal capabilities.
 * @param file The audio file to process
 * @param syncMode If true, instructs the model to preserve original timing/pauses for video dubbing
 */
export const transcribeAndTranslate = async (file: File, syncMode: boolean = false): Promise<TranslationResult> => {
  const base64Audio = await fileToBase64(file);
  const mimeType = file.type || 'audio/mp3'; // Fallback if type is missing

  // Prompt engineering for specific JSON output to get both original and translated text
  // If syncMode is enabled, we ask for dubbing-specific constraints (isochrony and pauses).
  const dubbingInstruction = syncMode 
    ? `CRITICAL INSTRUCTION FOR VIDEO DUBBING:
       The Spanish translation MUST match the exact rhythm, timing, and pauses of the original speaker. 
       - If the speaker pauses, insert ellipses (...) or commas to force the TTS to pause.
       - Match the length of the sentences to the original audio duration (isochrony).
       - This text will be used to replace the original audio in a video editor.` 
    : `Translate the transcription into natural, fluent Spanish.`;

  const prompt = `
    Analyze the audio file provided. 
    1. Transcribe the audio verbatim in its original language.
    2. ${dubbingInstruction}
    
    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Efficient and capable model
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Audio
          }
        },
        {
          text: prompt
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalTranscript: { type: Type.STRING },
          spanishText: { type: Type.STRING }
        },
        required: ['originalTranscript', 'spanishText']
      }
    }
  });

  const jsonText = response.text || "{}";
  try {
    const result = JSON.parse(jsonText);
    return {
      spanishText: result.spanishText,
      originalTranscript: result.originalTranscript
    };
  } catch (e) {
    console.error("Error parsing translation JSON:", e);
    throw new Error("Failed to parse translation response.");
  }
};

/**
 * Step 2: Generate Audio (Speech) from the translated text.
 * We use Gemini 2.5 Flash TTS preview.
 */
export const generateSpanishAudio = async (text: string, voiceName: VoiceOption = VoiceOption.PUCK): Promise<Blob> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("No audio data received from Gemini API.");
  }

  // Decode raw PCM data
  const pcmData = base64ToUint8Array(base64Audio);
  
  // Convert PCM to a playable WAV Blob (24kHz is standard for this model)
  const wavBlob = createWavBlob(pcmData, 24000);
  
  return wavBlob;
};