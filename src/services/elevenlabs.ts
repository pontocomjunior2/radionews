const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const API_BASE_URL = 'https://api.elevenlabs.io/v1';

export interface Voice {
  voice_id: string;
  name: string;
}

export async function getVoices(): Promise<Voice[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw new Error('Failed to fetch voices from ElevenLabs');
  }
}

export async function generateSpeech(text: string, voiceId: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech with ElevenLabs');
  }
}