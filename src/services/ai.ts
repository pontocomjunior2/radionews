// Generic AI service that supports multiple providers
export type AIProvider = 'gemini' | 'openai' | 'perplexity' | 'openrouter';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export async function rewriteNewsArticle(text: string, targetLength: number): Promise<string> {
  const provider = (import.meta.env.VITE_AI_PROVIDER || 'gemini') as AIProvider;
  
  console.log('🤖 AI: Iniciando processamento...');
  console.log('🤖 AI: Provedor selecionado:', provider);

  switch (provider) {
    case 'gemini':
      return await processWithGemini(text, targetLength);
    case 'openai':
      return await processWithOpenAI(text, targetLength);
    case 'perplexity':
      return await processWithPerplexity(text, targetLength);
    case 'openrouter':
      return await processWithOpenRouter(text, targetLength);
    default:
      throw new Error(`Provedor de IA não suportado: ${provider}`);
  }
}

async function processWithGemini(text: string, targetLength: number): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';

  if (!apiKey) {
    throw new Error('Google Gemini AI API key not configured');
  }

  console.log('🤖 Gemini: Modelo:', model);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const prompt = createPrompt(text, targetLength);
  
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();
    
    if (!generatedText || generatedText.trim().length === 0) {
      throw new Error('Empty response from Gemini AI');
    }
    
    return generatedText;
  } catch (error) {
    console.error('🤖 Gemini: Erro:', error);
    throw error;
  }
}

async function processWithOpenAI(text: string, targetLength: number): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🤖 OpenAI: Modelo:', model);

  const prompt = createPrompt(text, targetLength);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('Empty response from OpenAI');
    }

    return generatedText;
  } catch (error) {
    console.error('🤖 OpenAI: Erro:', error);
    throw error;
  }
}

async function processWithPerplexity(text: string, targetLength: number): Promise<string> {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  const model = import.meta.env.VITE_PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online';

  if (!apiKey) {
    throw new Error('Perplexity API key not configured');
  }

  console.log('🤖 Perplexity: Modelo:', model);

  const prompt = createPrompt(text, targetLength);

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('Empty response from Perplexity');
    }

    return generatedText;
  } catch (error) {
    console.error('🤖 Perplexity: Erro:', error);
    throw error;
  }
}

async function processWithOpenRouter(text: string, targetLength: number): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  console.log('🤖 OpenRouter: Modelo:', model);

  const prompt = createPrompt(text, targetLength);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'News Audio Generator',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('Empty response from OpenRouter');
    }

    return generatedText;
  } catch (error) {
    console.error('🤖 OpenRouter: Erro:', error);
    throw error;
  }
}

function createPrompt(text: string, targetLength: number): string {
  // Calcular aproximadamente quantas palavras cabem no tempo alvo
  // Velocidade média de leitura TTS: ~2.5 palavras por segundo
  const targetWords = Math.floor(targetLength * 2.5);
  
  return `
Reescreva esta notícia para rádio-jornalismo brasileiro com ${targetWords} palavras.

REGRAS:
- Exatamente ${targetWords} palavras (conte internamente, não mencione no texto)
- Estilo direto de rádio-jornalismo
- Números por extenso: "1" = "um", "2025" = "dois mil e vinte e cinco"
- Datas por extenso: "01/08" = "primeiro de agosto"
- Abreviações por extenso: "Dr." = "Doutor"
- Sem referências a outros meios de comunicação
- Linguagem clara para síntese de voz
- Comece direto com a notícia

PROIBIDO:
- Mencionar contagem de palavras
- Incluir confirmações ou comentários técnicos
- Adicionar introduções ou despedidas
- Comentar sobre o processo de reescrita

TEXTO ORIGINAL:
${text}

RESPOSTA (apenas a notícia reescrita):
`;
}