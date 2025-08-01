import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

export async function rewriteNewsArticle(text: string, targetLength: number): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error rewriting news article:', error);
    throw new Error('Failed to process news article with Gemini AI');
  }
}