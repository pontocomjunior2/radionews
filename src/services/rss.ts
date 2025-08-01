// Using fetch instead of rss-parser for better browser compatibility
export async function getLatestNews(rssUrl: string): Promise<string> {
  try {
    // Use a CORS proxy to fetch the RSS feed
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(corsProxy + encodeURIComponent(rssUrl));
    
    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed');
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    // Get the latest item
    const items = xmlDoc.querySelectorAll('item');
    if (items.length === 0) {
      throw new Error('No news items found in the RSS feed');
    }

    const latestItem = items[0];
    const title = latestItem.querySelector('title')?.textContent || '';
    const content = 
      latestItem.querySelector('content\\:encoded')?.textContent || 
      latestItem.querySelector('description')?.textContent || '';

    return `${title}\n\n${content}`;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw new Error('Failed to fetch news from RSS feed');
  }
}

export async function getNewsFromUrl(url: string): Promise<string> {
  try {
    // Use a CORS proxy to fetch the webpage
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(corsProxy + encodeURIComponent(url));
    
    if (!response.ok) {
      throw new Error('Failed to fetch news article');
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Try to find the main article content
    // This is a simple implementation - in production you'd want to use a more robust solution
    const article = doc.querySelector('article') || doc.querySelector('main');
    if (!article) {
      throw new Error('Could not find article content');
    }

    // Remove unwanted elements
    article.querySelectorAll('script, style, iframe, nav, header, footer, aside, .ad, .advertisement, .social-share')
      .forEach(el => el.remove());

    const title = doc.querySelector('h1')?.textContent || '';
    const content = article.textContent || '';

    return `${title}\n\n${content}`;
  } catch (error) {
    console.error('Error fetching news article:', error);
    throw new Error('Failed to fetch news article');
  }
}