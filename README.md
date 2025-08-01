# 🎙️ Gerador de Áudio de Notícias

Um gerador automático de áudio para notícias usando React, TypeScript, Google Gemini AI e ElevenLabs.

## 🚀 Funcionalidades

- **Geração Manual**: Processa notícias de URLs específicas ou feeds RSS
- **Geração Automática**: Agenda geração de áudio em horários específicos
- **Síntese de Voz**: Múltiplas vozes disponíveis via ElevenLabs
- **Controle de Duração**: Ajuste o tempo da notícia (30-180 segundos)
- **Download de Áudio**: Baixe os arquivos MP3 gerados

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **IA**: Google Gemini AI para reescrita de texto
- **TTS**: ElevenLabs para síntese de voz
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Chaves de API:
  - Google Gemini AI
  - ElevenLabs

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd radionews
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   ```
   
   Edite o arquivo `.env` com suas chaves de API:
   ```env
   # Escolha o provedor de IA
   VITE_AI_PROVIDER=gemini
   
   # Configure as chaves conforme o provedor escolhido
   VITE_GOOGLE_AI_API_KEY=sua_chave_do_gemini
   VITE_OPENAI_API_KEY=sua_chave_openai
   VITE_PERPLEXITY_API_KEY=sua_chave_perplexity
   VITE_OPENROUTER_API_KEY=sua_chave_openrouter
   
   # ElevenLabs (sempre necessário)
   VITE_ELEVENLABS_API_KEY=sua_chave_do_elevenlabs
   ```

4. **Execute em modo de desenvolvimento**
   ```bash
   npm run dev
   ```

## 🔐 Segurança

- ✅ Credenciais protegidas por variáveis de ambiente
- ✅ Arquivo `.env` ignorado pelo Git
- ✅ Exemplo de configuração em `env.example`

## 📝 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Executar linting
```

## ⚠️ Importante

- **Nunca** commite o arquivo `.env` no repositório
- As APIs utilizadas são pagas (Google Gemini AI e ElevenLabs)
- Configure CORS adequadamente para URLs de RSS externas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
## 🔧 Mode
los Disponíveis

### Google Gemini AI
Você pode configurar diferentes modelos do Gemini através da variável `VITE_GEMINI_MODEL`:

- `gemini-2.0-flash-exp` (recomendado) - Modelo mais recente e rápido
- `gemini-1.5-flash` - Modelo estável e confiável
- `gemini-1.5-pro` - Modelo mais avançado para tarefas complexas

### ElevenLabs
O sistema usa automaticamente o modelo `eleven_multilingual_v2` para suporte ao português brasileiro.#
# 🤖 Provedores de IA Suportados

Configure o provedor através da variável `VITE_AI_PROVIDER`:

### Google Gemini (`gemini`)
```env
VITE_AI_PROVIDER=gemini
VITE_GOOGLE_AI_API_KEY=sua_chave
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
```
**Modelos recomendados:**
- `gemini-2.0-flash-exp` - Mais recente e rápido
- `gemini-1.5-flash` - Estável e confiável
- `gemini-1.5-pro` - Para tarefas complexas

### OpenAI (`openai`)
```env
VITE_AI_PROVIDER=openai
VITE_OPENAI_API_KEY=sua_chave
VITE_OPENAI_MODEL=gpt-4o-mini
```
**Modelos recomendados:**
- `gpt-4o-mini` - Rápido e econômico
- `gpt-4o` - Mais avançado
- `gpt-3.5-turbo` - Econômico

### Perplexity (`perplexity`)
```env
VITE_AI_PROVIDER=perplexity
VITE_PERPLEXITY_API_KEY=sua_chave
VITE_PERPLEXITY_MODEL=llama-3.1-sonar-small-128k-online
```
**Modelos recomendados:**
- `llama-3.1-sonar-small-128k-online` - Rápido com acesso online
- `llama-3.1-sonar-large-128k-online` - Mais avançado

### OpenRouter (`openrouter`)
```env
VITE_AI_PROVIDER=openrouter
VITE_OPENROUTER_API_KEY=sua_chave
VITE_OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```
**Modelos recomendados:**
- `anthropic/claude-3.5-sonnet` - Excelente para texto
- `openai/gpt-4o-mini` - Rápido e econômico
- `meta-llama/llama-3.1-8b-instruct` - Open source