import {
  handleExpandEntities,
  handleMineAutocomplete,
  handleScoreAndBrief,
} from './src/server/radarApiHandlers';

export interface Env {
  GEMINI_API_KEY?: string;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === 'POST' && url.pathname === '/api/expand-entities') {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const result = await handleExpandEntities(body, env.GEMINI_API_KEY);
        return jsonResponse(result);
      } catch (err) {
        return jsonResponse(
          { error: err instanceof Error ? err.message : 'Failed to expand entities' },
          500
        );
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/mine-autocomplete') {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const result = await handleMineAutocomplete(body);
        return jsonResponse(result);
      } catch (err) {
        return jsonResponse(
          { error: err instanceof Error ? err.message : 'Failed to mine autocomplete' },
          500
        );
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/score-and-brief') {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const result = await handleScoreAndBrief(body, env.GEMINI_API_KEY);
        return jsonResponse(result);
      } catch (err) {
        return jsonResponse(
          { error: err instanceof Error ? err.message : 'Failed to score and brief' },
          500
        );
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Long-Tail Gift Radar Worker Active', { status: 200 });
  },
};
