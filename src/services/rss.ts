// Using fetch instead of rss-parser for better browser compatibility
export async function getLatestNews(rssUrl: string): Promise<string> {
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest='
  ];

  for (const corsProxy of corsProxies) {
    try {
      // Timeout de 8 segundos para RSS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(corsProxy + encodeURIComponent(rssUrl), {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        continue; // Try next proxy
      }

      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      // Check for XML parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        continue; // Try next proxy
      }

      // Get the latest item
      const items = xmlDoc.querySelectorAll('item');
      if (items.length === 0) {
        continue; // Try next proxy
      }

      const latestItem = items[0];
      const title = latestItem.querySelector('title')?.textContent || '';
      const content = 
        latestItem.querySelector('content\\:encoded')?.textContent || 
        latestItem.querySelector('description')?.textContent || '';

      if (title || content) {
        return `${title}\n\n${content}`;
      }
    } catch (error) {
      console.warn(`Failed with proxy ${corsProxy}:`, error);
      continue; // Try next proxy
    }
  }

  throw new Error('Failed to fetch news from RSS feed with all available proxies');
}

export async function getNewsFromUrl(url: string): Promise<string> {
  console.log('🌐 RSS: Iniciando extração de conteúdo da URL:', url);
  
  // Proxies ordenados por confiabilidade e velocidade
  const corsProxies = [
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/'
  ];

  console.log('🌐 RSS: Tentando', corsProxies.length, 'proxies CORS...');

  for (let i = 0; i < corsProxies.length; i++) {
    const corsProxy = corsProxies[i];
    console.log(`🌐 RSS: Tentativa ${i + 1}/${corsProxies.length} - Proxy:`, corsProxy);
    
    try {
      let response;
      let html;

      console.log('🌐 RSS: Fazendo requisição...');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      if (corsProxy.includes('allorigins.win/get')) {
        console.log('🌐 RSS: Usando allorigins.win (JSON response)');
        response = await fetch(corsProxy + encodeURIComponent(url), {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn('🌐 RSS: Resposta não OK:', response.status, response.statusText);
          continue;
        }
        
        console.log('🌐 RSS: Parseando JSON...');
        const data = await response.json();
        html = data.contents;
        console.log('🌐 RSS: HTML extraído do JSON. Tamanho:', html?.length || 0);
      } else {
        console.log('🌐 RSS: Usando proxy direto (HTML response)');
        response = await fetch(corsProxy + encodeURIComponent(url), {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn('🌐 RSS: Resposta não OK:', response.status, response.statusText);
          continue;
        }
        
        console.log('🌐 RSS: Extraindo HTML...');
        html = await response.text();
        console.log('🌐 RSS: HTML extraído. Tamanho:', html?.length || 0);
      }

      if (!html || html.length < 100) {
        console.warn('🌐 RSS: HTML muito pequeno ou vazio');
        continue;
      }

      console.log('🌐 RSS: Parseando HTML com DOMParser...');
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.warn('🌐 RSS: Erro no parser HTML');
        continue;
      }

      console.log('🌐 RSS: Procurando conteúdo do artigo...');
      
      // Multiple strategies to find article content
      const contentSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.content',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.news-content',
        '.story-body',
        '.article-body',
        '.mc-article-body', // G1 specific
        '.content-text', // G1 specific
        '.entry-title' // Generic
      ];

      let article: Element | null = null;
      for (const selector of contentSelectors) {
        article = doc.querySelector(selector);
        if (article) {
          console.log('🌐 RSS: Conteúdo encontrado com seletor:', selector);
          break;
        }
      }

      // Fallback: try to find content by common patterns
      if (!article) {
        console.log('🌐 RSS: Tentando fallback com parágrafos...');
        const paragraphs = doc.querySelectorAll('p');
        console.log('🌐 RSS: Encontrados', paragraphs.length, 'parágrafos');
        
        if (paragraphs.length > 3) {
          // Create a temporary container with the paragraphs
          article = document.createElement('div') as Element;
          let addedParagraphs = 0;
          paragraphs.forEach(p => {
            if (p.textContent && p.textContent.length > 50) {
              article?.appendChild(p.cloneNode(true));
              addedParagraphs++;
            }
          });
          console.log('🌐 RSS: Adicionados', addedParagraphs, 'parágrafos ao fallback');
        }
      }

      if (!article || !article.textContent?.trim()) {
        console.warn('🌐 RSS: Nenhum conteúdo encontrado');
        continue;
      }

      console.log('🌐 RSS: Removendo elementos indesejados...');
      // Remove unwanted elements
      article.querySelectorAll('script, style, iframe, nav, header, footer, aside, .ad, .advertisement, .social-share, .related, .comments')
        .forEach(el => el.remove());

      console.log('🌐 RSS: Procurando título...');
      // Get title from multiple possible locations
      const titleSelectors = ['h1', '.title', '.headline', '.article-title', '.post-title', '.entry-title'];
      let title = '';
      for (const selector of titleSelectors) {
        const titleEl = doc.querySelector(selector);
        if (titleEl?.textContent?.trim()) {
          title = titleEl.textContent.trim();
          console.log('🌐 RSS: Título encontrado:', title.substring(0, 100) + '...');
          break;
        }
      }

      const content = article.textContent?.trim() || '';
      console.log('🌐 RSS: Conteúdo extraído. Tamanho:', content.length, 'caracteres');
      
      if (content.length > 100) {
        console.log('🌐 RSS: ✅ Extração bem-sucedida!');
        return `${title}\n\n${content}`;
      } else {
        console.warn('🌐 RSS: Conteúdo muito pequeno:', content.length, 'caracteres');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`🌐 RSS: Timeout com proxy ${corsProxy}`);
      } else {
        console.warn(`🌐 RSS: Erro com proxy ${corsProxy}:`, error);
      }
      continue;
    }
  }

  console.error('🌐 RSS: ❌ Falha com todos os proxies');
  throw new Error('Failed to fetch news article with all available proxies. Try using an RSS feed instead.');
}