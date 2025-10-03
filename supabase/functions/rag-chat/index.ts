import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!HUGGINGFACE_API_KEY || !GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // 1. Generate embedding using Hugging Face
    console.log('Generating embedding for query...');
    const embeddingResponse = await fetch(
      'https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: [message], options: { wait_for_model: true } }),
      }
    );

    if (!embeddingResponse.ok) {
      throw new Error(`Embedding generation failed: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = Array.isArray(embeddingData) && embeddingData[0] 
      ? embeddingData[0] 
      : embeddingData;

    // 2. Retrieve similar chunks from Supabase
    console.log('Retrieving similar chunks...');
    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/match_documents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_embedding: queryEmbedding,
          match_count: 8,
          filter: { source: '../dataset/human-nutrition-text.pdf' },
        }),
      }
    );

    if (!supabaseResponse.ok) {
      throw new Error(`Supabase query failed: ${supabaseResponse.status}`);
    }

    const chunks = await supabaseResponse.json();

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find relevant information in the nutrition document. Try rephrasing your question.",
          sources: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Build context from chunks
    const context = chunks
      .map((c: any, i: number) => `[${i + 1}] (Page ${c.metadata?.page ?? '?'}) ${c.content}`)
      .join('\n\n');

    // 4. Generate answer using Gemini
    console.log('Generating answer with Gemini...');
    const systemPrompt = 
      "You are a strict RAG assistant for a nutrition document. Answer ONLY using the CONTEXT provided below. " +
      "If the answer is not in the context, say: 'I couldn't find this in the provided document.' " +
      "Always cite sources using [1], [2], etc., and mention page numbers when making claims.";

    const userMessage = `QUESTION: ${message}\n\nCONTEXT:\n${context}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini error:', errorText);
      throw new Error(`Gemini generation failed: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const answer = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Error generating response from LLM.';

    return new Response(
      JSON.stringify({ answer, sources: chunks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('RAG chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
