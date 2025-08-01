import React, { useState, useEffect, useRef } from 'react';
import { Clock, Mic2, Download, Globe, Rss, AlertCircle } from 'lucide-react';
import { getVoices, generateSpeech, type Voice } from './services/elevenlabs';
import { rewriteNewsArticle } from './services/ai';
import { getLatestNews, getNewsFromUrl } from './services/rss';

interface GeneratedNews {
  timestamp: Date;
  filename: string;
}

function App() {
  const [rssUrl, setRssUrl] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [newsLength, setNewsLength] = useState<number>(60);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [saveToLocal, setSaveToLocal] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<GeneratedNews | null>(null);
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  const [minutes, setMinutes] = useState<string>('00');
  const [nextGenerationTime, setNextGenerationTime] = useState<string | null>(null);
  
  const autoGenerateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadVoices();
    return () => {
      if (autoGenerateRef.current) {
        clearInterval(autoGenerateRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('Auto-generate state changed:', autoGenerate);
    if (autoGenerate) {
      if (!rssUrl) {
        setError('Por favor, preencha a URL do RSS para usar a Geração Automática');
        return;
      }
      startAutoGeneration();
    } else {
      if (autoGenerateRef.current) {
        clearInterval(autoGenerateRef.current);
      }
    }

    return () => {
      if (autoGenerateRef.current) {
        clearInterval(autoGenerateRef.current);
      }
    };
  }, [autoGenerate, selectedHours, minutes]);

  const startAutoGeneration = () => {
    if (selectedHours.length === 0) {
      setError('Selecione pelo menos um horário para a geração automática');
      return;
    }

    const checkAndGenerate = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const targetMinute = parseInt(minutes) || 0;

      if (selectedHours.includes(currentHour) && currentMinute === targetMinute) {
        handleGenerate();
      } else {
        updateNextGenerationTime(now);
      }
    };

    // Initial check
    checkAndGenerate();

    // Check every minute
    autoGenerateRef.current = setInterval(checkAndGenerate, 60000);
  };

  const updateNextGenerationTime = (now: Date) => {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const targetMinute = parseInt(minutes) || 0;

    let nextHour = selectedHours.find(hour => hour > currentHour) || selectedHours[0];
    let nextDay = nextHour <= currentHour;

    if (nextHour === currentHour && currentMinute >= targetMinute) {
      nextHour = selectedHours.find(hour => hour > currentHour) || selectedHours[0];
      nextDay = true;
    }

    const nextTime = new Date(now);
    nextTime.setHours(nextHour, targetMinute, 0, 0);
    if (nextDay) {
      nextTime.setDate(nextTime.getDate() + 1);
    }

    const timeDiff = nextTime.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    setNextGenerationTime(`${hours}h ${minutes}m`);
  };

  const loadVoices = async () => {
    try {
      const availableVoices = await getVoices();
      setVoices(availableVoices);
    } catch (error) {
      setError('Failed to load voices. Please check your API key.');
      console.error('Error loading voices:', error);
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const generateFilename = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = pad(date.getDate());
    const m = pad(date.getMonth() + 1);
    const y = date.getFullYear();
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `noticia_${d}-${m}-${y}__${h}-${min}.mp3`;
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);
    return interval;
  };

  const handleHourToggle = (hour: number) => {
    setSelectedHours(prev => 
      prev.includes(hour)
        ? prev.filter(h => h !== hour)
        : [...prev, hour].sort((a, b) => a - b)
    );
  };

  const handleMinutesChange = (value: string) => {
    const numValue = parseInt(value);
    if (value === '' || (numValue >= 0 && numValue < 60)) {
      setMinutes(value);
    }
  };

  const handleAutoGenerateToggle = (checked: boolean) => {
    console.log('Auto-generate checkbox toggled:', checked);
    if (checked && newsUrl) {
      setError('URL da notícia é válido somente para Geração Manual. Para uso da Geração Automática preencha URL do RSS.');
      return;
    }
    setAutoGenerate(checked);
  };

  const handleGenerate = async () => {
    if ((!rssUrl && !newsUrl) || !selectedVoice) {
      setError('Por favor, preencha a URL (RSS ou Notícia) e selecione uma voz');
      return;
    }

    if (autoGenerate && !rssUrl) {
      setError('Para Geração Automática, preencha a URL do RSS');
      return;
    }

    // Validate API keys based on selected provider
    const aiProvider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
    
    switch (aiProvider) {
      case 'gemini':
        if (!import.meta.env.VITE_GOOGLE_AI_API_KEY) {
          setError('Chave do Google Gemini AI não configurada. Verifique o arquivo .env');
          return;
        }
        break;
      case 'openai':
        if (!import.meta.env.VITE_OPENAI_API_KEY) {
          setError('Chave do OpenAI não configurada. Verifique o arquivo .env');
          return;
        }
        break;
      case 'perplexity':
        if (!import.meta.env.VITE_PERPLEXITY_API_KEY) {
          setError('Chave do Perplexity não configurada. Verifique o arquivo .env');
          return;
        }
        break;
      case 'openrouter':
        if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
          setError('Chave do OpenRouter não configurada. Verifique o arquivo .env');
          return;
        }
        break;
    }

    if (!import.meta.env.VITE_ELEVENLABS_API_KEY) {
      setError('Chave do ElevenLabs não configurada. Verifique o arquivo .env');
      return;
    }

    setIsProcessing(true);
    setError(null);
    const progressInterval = simulateProgress();

    try {
      console.log('🚀 Iniciando geração de áudio...');
      setCurrentStep('Iniciando processo...');
      let newsText;
      
      if (rssUrl) {
        console.log('📡 Buscando notícias do RSS:', rssUrl);
        setCurrentStep('Buscando notícias do RSS...');
        try {
          newsText = await getLatestNews(rssUrl);
          console.log('✅ RSS carregado com sucesso. Tamanho:', newsText.length, 'caracteres');
        } catch (error) {
          console.error('❌ Erro ao buscar RSS:', error);
          throw new Error('Falha ao buscar notícias do RSS. Verifique se a URL está correta e acessível.');
        }
      } else {
        console.log('🌐 Extraindo conteúdo da URL:', newsUrl);
        setCurrentStep('Extraindo conteúdo da página...');
        try {
          newsText = await getNewsFromUrl(newsUrl);
          console.log('✅ Conteúdo extraído com sucesso. Tamanho:', newsText.length, 'caracteres');
        } catch (error) {
          console.error('❌ Erro ao extrair conteúdo:', error);
          throw new Error('Falha ao extrair conteúdo da página. Tente usar uma URL de RSS ou uma página de notícia diferente.');
        }
      }

      if (!newsText || newsText.trim().length < 50) {
        console.error('❌ Conteúdo muito curto:', newsText?.length || 0, 'caracteres');
        throw new Error('Conteúdo da notícia muito curto ou vazio. Tente uma fonte diferente.');
      }

      const aiProvider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
      console.log(`🤖 Processando texto com ${aiProvider.toUpperCase()}...`);
      setCurrentStep(`Processando texto com ${aiProvider.toUpperCase()}...`);
      let rewrittenText;
      try {
        rewrittenText = await rewriteNewsArticle(newsText, newsLength);
        
        // Limpar qualquer menção a contagem de palavras ou comentários técnicos
        rewrittenText = rewrittenText
          .replace(/\b\d+\s*palavras?\b/gi, '')
          .replace(/\bexatamente\s+\d+\b/gi, '')
          .replace(/\bcontagem\b/gi, '')
          .replace(/\btotal\s*de\s*\d+\b/gi, '')
          .replace(/\b\d+\s*segundos?\b/gi, '')
          .replace(/\btempo\s*alvo\b/gi, '')
          .replace(/\bresultado\s*esperado\b/gi, '')
          .replace(/\bconfirm[oa]\b/gi, '')
          .replace(/\.\s*$/, '.') // Remove espaços extras no final
          .trim();
        
        console.log('✅ Texto reescrito com sucesso. Tamanho:', rewrittenText.length, 'caracteres');
        
        // Validar se o tempo está sendo respeitado
        const wordCount = rewrittenText.split(/\s+/).filter(word => word.length > 0).length;
        const estimatedTime = Math.ceil(wordCount / 2.5); // 2.5 palavras por segundo
        console.log('📊 Análise do texto:');
        console.log('   - Palavras:', wordCount);
        console.log('   - Tempo estimado:', estimatedTime, 'segundos');
        console.log('   - Tempo alvo:', newsLength, 'segundos');
        
        if (Math.abs(estimatedTime - newsLength) > 5) {
          console.warn('⚠️ Tempo estimado difere significativamente do alvo');
        }
        
        console.log('📝 Texto final:', rewrittenText.substring(0, 200) + '...');
      } catch (error) {
        console.error('❌ Erro na IA:', error);
        throw new Error('Falha ao processar o texto com IA. Verifique sua configuração de IA.');
      }

      console.log('🎤 Gerando áudio com ElevenLabs...');
      setCurrentStep('Gerando áudio...');
      console.log('🔊 Voz selecionada:', selectedVoice);
      let audioUrl;
      try {
        audioUrl = await generateSpeech(rewrittenText, selectedVoice);
        console.log('✅ Áudio gerado com sucesso!');
      } catch (error) {
        console.error('❌ Erro no ElevenLabs:', error);
        throw new Error('Falha ao gerar áudio. Verifique sua chave do ElevenLabs.');
      }
      
      setCurrentStep('Finalizando...');
      const timestamp = new Date();
      const filename = generateFilename(timestamp);

      if (saveToLocal) {
        console.log('💾 Salvando arquivo:', filename);
        setLastGenerated({
          timestamp,
          filename: `/noticias/${filename}`
        });
      } else {
        console.log('🎵 Definindo URL do áudio para reprodução');
        setAudioUrl(audioUrl);
      }

      console.log('🎉 Processo concluído com sucesso!');
      setCurrentStep('Concluído!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao processar a notícia. Por favor, tente novamente.';
      setError(errorMessage);
      console.error('💥 Erro durante a geração:', error);
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setCurrentStep('');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Gerador de Áudio de Notícias
        </h1>
        
        {/* AI Provider Indicator */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            🤖 IA: {(import.meta.env.VITE_AI_PROVIDER || 'gemini').toUpperCase()}
          </span>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* RSS URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium flex items-center gap-2">
              <Rss size={18} />
              URL do RSS
            </label>
            <input
              type="url"
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://exemplo.com/rss"
            />
          </div>

          {/* News URL Input - Hidden in Auto Generate mode */}
          {!autoGenerate && (
            <div className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-2">
                <Globe size={18} />
                URL da Notícia
              </label>
              <input
                type="url"
                value={newsUrl}
                onChange={(e) => setNewsUrl(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://exemplo.com/noticia"
              />
            </div>
          )}

          {/* Auto Generate Section */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => handleAutoGenerateToggle(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-sm font-medium">Geração Automática</span>
            </label>

            {/* Time Selection - Only visible when Auto Generate is enabled */}
            {autoGenerate && (
              <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                <div className="space-y-2">
                  <label className="block text-sm font-medium flex items-center gap-2">
                    <Clock size={18} />
                    Horários de Geração
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 24 }, (_, i) => (
                      <label
                        key={i}
                        className={`
                          flex items-center justify-center p-2 rounded cursor-pointer text-sm
                          ${selectedHours.includes(i)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600'}
                        `}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedHours.includes(i)}
                          onChange={() => handleHourToggle(i)}
                        />
                        {i.toString().padStart(2, '0')}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Minutos
                  </label>
                  <input
                    type="text"
                    value={minutes}
                    onChange={(e) => handleMinutesChange(e.target.value)}
                    className="w-24 px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="00"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={saveToLocal}
                      onChange={(e) => setSaveToLocal(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm font-medium">Salvar em /noticias</span>
                  </label>
                </div>

                {nextGenerationTime && (
                  <div className="text-sm text-gray-400">
                    Próxima geração em: {nextGenerationTime}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* News Length Slider */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Tempo da Notícia (segundos)
            </label>
            <input
              type="range"
              min="30"
              max="180"
              step="30"
              value={newsLength}
              onChange={(e) => setNewsLength(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm">{newsLength} segundos</div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium flex items-center gap-2">
              <Mic2 size={18} />
              Voz do Repórter
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Selecione uma voz</option>
              {voices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              {currentStep && (
                <div className="text-sm text-gray-300 text-center">
                  {currentStep}
                </div>
              )}
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            {isProcessing ? 'Processando...' : autoGenerate ? 'PROGRAMAR' : 'GERAR NOTICIA'}
          </button>

          {/* Last Generated Info */}
          {lastGenerated && (
            <div className="mt-4 p-4 bg-gray-700 rounded-md">
              <h3 className="font-semibold mb-2">Última Notícia Gerada:</h3>
              <p className="text-sm">
                Data: {formatTimestamp(lastGenerated.timestamp)}
              </p>
              <p className="text-sm">
                Arquivo: {lastGenerated.filename}
              </p>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && !saveToLocal && (
            <div className="space-y-4">
              <audio
                controls
                className="w-full"
                src={audioUrl}
              >
                Seu navegador não suporta o elemento de áudio.
              </audio>
              
              <a
                href={audioUrl}
                download
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
              >
                <Download size={18} />
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
