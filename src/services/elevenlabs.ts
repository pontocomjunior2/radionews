const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const API_BASE_URL = 'https://api.elevenlabs.io/v1';

export interface Voice {
  voice_id: string;
  name: string;
}

export async function getVoices(): Promise<Voice[]> {
  console.log('🎤 ElevenLabs: Carregando vozes disponíveis...');
  
  if (!ELEVEN_LABS_API_KEY) {
    console.error('🎤 ElevenLabs: API key não configurada para carregar vozes');
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    console.log('🎤 ElevenLabs: Fazendo requisição para /voices...');
    const response = await fetch(`${API_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
    });

    console.log('🎤 ElevenLabs: Resposta das vozes. Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎤 ElevenLabs: Erro ao carregar vozes:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      }
      throw new Error(`Failed to fetch voices: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const voices = data.voices || [];
    console.log('🎤 ElevenLabs: Vozes carregadas com sucesso:', voices.length, 'vozes encontradas');
    console.log('🎤 ElevenLabs: Vozes:', voices.map(v => v.name).join(', '));
    
    return voices;
  } catch (error) {
    console.error('🎤 ElevenLabs: Erro ao carregar vozes:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch voices from ElevenLabs');
  }
}

export async function generateSpeech(text: string, voiceId: string): Promise<string> {
  console.log('🎤 ElevenLabs: Iniciando geração de áudio...');
  
  if (!ELEVEN_LABS_API_KEY) {
    console.error('🎤 ElevenLabs: API key não configurada');
    throw new Error('ElevenLabs API key not configured');
  }

  console.log('🎤 ElevenLabs: API key encontrada');
  console.log('🎤 ElevenLabs: Voice ID:', voiceId);
  console.log('🎤 ElevenLabs: Tamanho do texto:', text.length, 'caracteres');
  console.log('🎤 ElevenLabs: Texto (primeiros 100 chars):', text.substring(0, 100) + '...');

  try {
    const requestBody = {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    };

    console.log('🎤 ElevenLabs: Enviando requisição para API...');
    console.log('🎤 ElevenLabs: URL:', `${API_BASE_URL}/text-to-speech/${voiceId}`);
    
    const response = await fetch(`${API_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🎤 ElevenLabs: Resposta recebida. Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎤 ElevenLabs: Erro na resposta:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      }
      if (response.status === 429) {
        throw new Error('ElevenLabs API rate limit exceeded');
      }
      throw new Error(`Failed to generate speech: ${response.status} - ${errorText}`);
    }

    console.log('🎤 ElevenLabs: Convertendo resposta para blob...');
    const audioBlob = await response.blob();
    console.log('🎤 ElevenLabs: Blob criado. Tamanho:', audioBlob.size, 'bytes');
    
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('🎤 ElevenLabs: URL do áudio criada:', audioUrl);
    
    return audioUrl;
  } catch (error) {
    console.error('🎤 ElevenLabs: Erro durante geração:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate speech with ElevenLabs');
  }
}