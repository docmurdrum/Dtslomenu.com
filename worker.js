// GEMINI_KEY is stored in Cloudflare environment variables — never hardcoded

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    const url = new URL(request.url);
    const key = env.GEMINI_KEY;

    // ── ROUTE: /scan — Gemini image analysis ──
    if (url.pathname === '/scan') {
      return handleScan(request, key);
    }

    // ── ROUTE: / — Gemini image generation ──
    return handleGenerate(request, key);
  }
};

// ══════════════════════════════════════════════
// IMAGE GENERATION via Gemini 2.5 Flash Image
// ══════════════════════════════════════════════
async function handleGenerate(request, key) {
  const body = await request.json();
  const prompt = body.inputs || body.prompt || '';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    })
  });

  const data = await res.json();

  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || 'Gemini error ' + res.status }), {
      status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  // Extract the image bytes from the response
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inlineData);

  if (!imgPart) {
    return new Response(JSON.stringify({ error: 'No image returned by Gemini' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  // Decode base64 image and return as binary
  const imageBytes = Uint8Array.from(atob(imgPart.inlineData.data), c => c.charCodeAt(0));
  return new Response(imageBytes, {
    status: 200,
    headers: { ...CORS, 'Content-Type': imgPart.inlineData.mimeType || 'image/png' }
  });
}

// ══════════════════════════════════════════════
// IMAGE SCANNER via Gemini 2.0 Flash (vision)
// ══════════════════════════════════════════════
async function handleScan(request, key) {
  const body = await request.json();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  const systemPrompt = `You are a character art director for DTSLO nightlife app. Analyze the image and respond ONLY with a JSON object, no markdown, no extra text:
{
  "style_breakdown": "2-3 sentences on art style, technique, rendering",
  "colors_mood": "2-3 sentences on color palette, lighting, mood",
  "char_format": {
    "palette": "short color phrase like 'electric blue and gold, neon black background'",
    "bg": "short background scene phrase",
    "base": "base character starting with 'cartoon figure...'",
    "elements": ["element 1", "element 2", "element 3", "element 4", "element 5"]
  },
  "ready_prompt": "retro rubber hose cartoon portrait, grotesquely expressive face, bulging eyes, impossibly wide grin, thick wobbly outlines, close-up exaggerated features, elastic limbs, 1990s Nickelodeon cartoon aesthetic, ultra detailed cartoon style, no text, no watermark, [palette from analysis], [base from analysis], [elements from analysis], full scene background: [bg from analysis]"
}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: systemPrompt },
          { inlineData: { mimeType: body.media_type || 'image/jpeg', data: body.image_data } }
        ]
      }]
    })
  });

  const data = await res.json();

  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || 'Gemini scan error ' + res.status }), {
      status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim() || '';
  return new Response(text, {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}
