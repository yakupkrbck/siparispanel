// CiroLog AI Proxy — Cloudflare Worker
// Deploy: https://dash.cloudflare.com → Workers → Create Worker
// Bu kodu yapıştır, Deploy et, URL'yi kopyala → app.html'e yaz

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,   // Worker Secret'tan gelir
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: body.messages,
        }),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};

/*
KURULUM ADIMLARI:
─────────────────
1. https://dash.cloudflare.com → Workers & Pages → Create Application → Create Worker
2. Bu kodu yapıştır, "Deploy" tıkla
3. Settings → Variables → Secret → "ANTHROPIC_API_KEY" ekle (Anthropic API key'ini gir)
4. Worker URL'ni kopyala (örn: https://cirolog-ai.senin-subdomain.workers.dev)
5. app.html içinde şu satırı bul:
      const AI_PROXY = 'BURAYA_WORKER_URL';
   Ve URL'yi yapıştır

NOT: Anthropic API key almak için → https://console.anthropic.com
*/
