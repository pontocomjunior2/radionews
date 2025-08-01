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
   VITE_GOOGLE_AI_API_KEY=sua_chave_do_gemini
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