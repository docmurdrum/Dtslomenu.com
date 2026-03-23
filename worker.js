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

    // ── SCANNER: POST /scan — Gemini vision (still free for analysis) ──
    if (url.pathname === '/scan') {
      return handleScan(request, env);
    }

    // ── IMAGE GEN: POST / — Hugging Face ──
    return handleGenerate(request, env);
  }
};

async function handleGenerate(request, env) {
  const body = await request.json();
  const hfToken = env.HF_TOKEN;

  const res = await fetch(
    'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + hfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: body.inputs,
        options: { wait_for_model: true },
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 768,
          height: 768
        }
      })
    }
  );

  const rb = await res.arrayBuffer();
  return new Response(rb, {
    status: res.status,
    headers: {
      ...CORS,
      'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream'
    }
  });
}

async function handleScan(request, env) {
  const body = await request.json();
  const geminiKey = env.GEMINI_KEY;

  const systemPrompt = `You are a character art director for DTSLO nightlife app. Analyze the image and respond ONLY with a JSON object, no markdown, no extra text:
{
  "style_breakdown": "2-3 sentences on art style, technique, rendering",
  "colors_mood": "2-3 sentences on color palette, lighting, mood",
  "char_format": {
    "palette": "short color phrase",
    "bg": "short background scene phrase",
    "base": "base character starting with cartoon figure...",
    "elements": ["element 1", "element 2", "element 3", "element 4", "element 5"]
  },
  "ready_prompt": "retro rubber hose cartoon portrait, grotesquely expressive face, bulging eyes, impossibly wide grin, thick wobbly outlines, close-up exaggerated features, elastic limbs, 1990s Nickelodeon cartoon aesthetic, ultra detailed cartoon style, no text, no watermark, [palette], [base], [elements], full scene background: [bg]"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
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
    }
  );

  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || 'Scan error' }), {
      status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim() || '';
  return new Response(text, {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}
