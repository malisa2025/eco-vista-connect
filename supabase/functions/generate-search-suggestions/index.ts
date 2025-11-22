import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we have cached suggestions
    const { data: cached } = await supabase
      .from('search_suggestions')
      .select('suggestions, updated_at')
      .eq('query', query.toLowerCase())
      .single();

    // Return cached if recent (less than 24 hours old)
    if (cached && new Date(cached.updated_at).getTime() > Date.now() - 86400000) {
      return new Response(
        JSON.stringify({ suggestions: cached.suggestions, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's search history for personalization
    let userHistory: string[] = [];
    if (userId) {
      const { data: history } = await supabase
        .from('search_history')
        .select('search_query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      userHistory = history?.map(h => h.search_query) || [];
    }

    // Get popular searches
    const { data: popular } = await supabase
      .from('search_suggestions')
      .select('query, popularity_score')
      .order('popularity_score', { ascending: false })
      .limit(5);

    const popularSearches = popular?.map(p => p.query) || [];

    // Get business categories for context
    const { data: categories } = await supabase
      .from('business_categories')
      .select('name');

    const categoryNames = categories?.map(c => c.name) || [];

    // Call Lovable AI for intelligent suggestions
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a smart search assistant for a Ghana business directory. Generate 5 relevant search suggestions based on the user's partial query.
            
Available business categories: ${categoryNames.join(', ')}
Popular searches: ${popularSearches.join(', ')}
${userHistory.length > 0 ? `User's recent searches: ${userHistory.join(', ')}` : ''}

Rules:
- Suggestions should be specific and actionable
- Include category names when relevant
- Consider Ghana context (regions, local businesses)
- Personalize based on user history when available
- Keep suggestions concise (max 4 words each)`
          },
          {
            role: 'user',
            content: `User typed: "${query}". Generate 5 search suggestions.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_suggestions",
            description: "Generate search suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of 5 search suggestions"
                }
              },
              required: ["suggestions"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_suggestions" } }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    const suggestions = JSON.parse(toolCall.function.arguments).suggestions;

    // Cache the suggestions
    await supabase
      .from('search_suggestions')
      .upsert({
        query: query.toLowerCase(),
        suggestions,
        popularity_score: (cached?.popularity_score || 0) + 1,
        updated_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({ suggestions, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-search-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
