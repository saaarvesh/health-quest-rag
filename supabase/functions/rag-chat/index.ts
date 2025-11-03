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
      'https://router.huggingface.co/models/BAAI/bge-small-en-v1.5',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('HuggingFace API error:', errorText);
      throw new Error(`Embedding generation failed: ${embeddingResponse.status} - ${errorText}`);
    }

    const embeddingData = await embeddingResponse.json();
    console.log('Embedding response type:', typeof embeddingData, 'isArray:', Array.isArray(embeddingData));
    
    // The API returns embeddings in format: [[embedding_values]] or [embedding_values]
    const queryEmbedding = Array.isArray(embeddingData[0]) 
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
          match_count: 12,
          filter: { source: '../dataset/human-nutrition-text.pdf' },
        }),
      }
    );

    if (!supabaseResponse.ok) {
      throw new Error(`Supabase query failed: ${supabaseResponse.status}`);
    }

    const chunks = await supabaseResponse.json();

    // 3. Determine if we have relevant context (similarity threshold)
    const relevantChunks = chunks.filter((c: any) => c.similarity > 0.3);
    const hasRelevantContext = relevantChunks.length > 0;

    // 4. Build context from chunks if relevant
    let systemPrompt = '';
    let userMessage = '';

    if (hasRelevantContext) {
      const context = relevantChunks
        .map((c: any, i: number) => `[${i + 1}] (Page ${c.metadata?.page ?? '?'}) ${c.content}`)
        .join('\n\n');

      systemPrompt = 
        "You are an AI assistant specializing in human nutrition. " +
        "You have access to a nutrition textbook and your own general knowledge. " +
        "When the CONTEXT below contains relevant information, prioritize it and cite sources using ONLY the format [1], [2], [3], etc. " +
        "NEVER write inline page references like 'p. 46' or 'page 46' - ONLY use [1], [2] format for citations. " +
        "If the context doesn't cover the question but you can answer from your general knowledge, provide a helpful response. " +
        "Be conversational and friendly for greetings and casual questions.";

      userMessage = `QUESTION: ${message}\n\nCONTEXT:\n${context}`;
    } else {
      // No relevant context found, use general knowledge
      systemPrompt = 
        "You are a helpful AI assistant specializing in human nutrition. " +
        "Answer questions using your general knowledge about nutrition and health. " +
        "Be conversational and friendly. For greetings, respond naturally.";

      userMessage = message;
    }

    // 5. Generate answer using Gemini
    console.log('Generating answer with Gemini...');
    console.log('Has relevant context:', hasRelevantContext);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
      JSON.stringify({ answer, sources: hasRelevantContext ? relevantChunks : [] }),
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
