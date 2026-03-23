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

    const body = await request.json();

    const res = await fetch(
      'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + env.HF_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: body.inputs,
          options: { wait_for_model: true },
          parameters: { num_inference_steps: 30, guidance_scale: 7.5, width: 768, height: 768 }
        })
      }
    );

    const rb = await res.arrayBuffer();
    return new Response(rb, {
      status: res.status,
      headers: { ...CORS, 'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream' }
    });
  }
};
