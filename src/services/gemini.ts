import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';

export async function rewriteNewsArticle(text: string, targetLength: number): Promise<string> {
  console.log('🤖 Gemini: Iniciando processamento...');
  
  if (!API_KEY) {
    console.error('🤖 Gemini: API key não configurada');
    throw new Error('Google Gemini AI API key not configured');
  }

  console.log('🤖 Gemini: API key encontrada, inicializando cliente...');
  console.log('🤖 Gemini: Modelo selecionado:', MODEL_NAME);
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
  Você é um repórter Brasileiro e irá reescrever a notícia para o estilo rádio-jornalismo para que uma ferramente text-to-speech do Eleven Labs faça a leitura do seu texto.
  
  Siga estas instruções para reescrever a notícia:
  - Respeito o tempo de leitura para o máximo de ${targetLength} segundos em leitura com velocidade normal.
  - Adapte o texto precisamente ao tempo alvo da leitura do seu texto adaptado.
  - Elimine frases que vinculem a algum veículo de comunicação, ou que sugira que o usuario assista ou ouça algum programa de TV, Youtube ou Rádio.
  - Caso o tempo de leitura seja maior que o artigo, considere o tempo do artigo como base.
  - Elimina abreviações e busque o significado completo das palavras, escrevendo-as por extenso.
  - Remova datas entre parenteses e substitua por palavras por extenso incluindo a instrução (Ex. "Terça-Feira (04)" = "Na Terça-Feira dia 04")
  - Converta todos os números em extenso.
  - Evite usar palavras que possam ser confundidas com outras palavras.
  - Otimize o texto para TTS em Português Brasileiro.
  - Não inclua qualquer tipo de saudação ou despedida. Comece o texto imediatamente com o conteudo da notícia.  
  
  Input text:
  ${text}
  `;

  try {
    console.log('🤖 Gemini: Enviando requisição para API...');
    console.log('🤖 Gemini: Tamanho do texto de entrada:', text.length, 'caracteres');
    console.log('🤖 Gemini: Tempo alvo:', targetLength, 'segundos');
    
    const result = await model.generateContent(prompt);
    console.log('🤖 Gemini: Resposta recebida, processando...');
    
    const response = await result.response;
    const generatedText = response.text();
    
    console.log('🤖 Gemini: Texto gerado com sucesso');
    console.log('🤖 Gemini: Tamanho do texto gerado:', generatedText.length, 'caracteres');
    
    if (!generatedText || generatedText.trim().length === 0) {
      console.error('🤖 Gemini: Resposta vazia recebida');
      throw new Error('Empty response from Gemini AI');
    }
    
    return generatedText;
  } catch (error) {
    console.error('🤖 Gemini: Erro durante processamento:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Google Gemini AI API key');
      }
      if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Google Gemini AI quota exceeded');
      }
      throw error;
    }
    
    throw new Error('Failed to process news article with Gemini AI');
  }
}