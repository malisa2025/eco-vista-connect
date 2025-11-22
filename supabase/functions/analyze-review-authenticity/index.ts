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
    const { reviewId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the review details
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      throw new Error('Review not found');
    }

    // Get other reviews by the same user
    const { data: userReviews } = await supabase
      .from('reviews')
      .select('title, comment, rating, created_at')
      .eq('user_id', review.user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get other reviews for the same business
    const { data: businessReviews } = await supabase
      .from('reviews')
      .select('title, comment, rating')
      .eq('business_id', review.business_id)
      .neq('id', reviewId)
      .limit(20);

    // Call Lovable AI for authenticity analysis
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
            content: `You are a review authenticity analyzer. Analyze reviews for signs of fake, spam, or suspicious content.

Red flags to look for:
- Generic/template language
- Excessive promotional language
- Duplicate or very similar content across reviews
- Inconsistent sentiment (title vs comment)
- Extremely short or vague content
- All-caps or excessive punctuation
- Competitor mentions or comparisons
- Unrealistic claims

Score from 0-100 where:
- 0-30: High probability of fake/spam
- 31-60: Suspicious, needs review
- 61-85: Likely authentic
- 86-100: Highly authentic

Provide reasoning for the score.`
          },
          {
            role: 'user',
            content: `Analyze this review:

Title: "${review.title}"
Comment: "${review.comment}"
Rating: ${review.rating}/5

User's other reviews: ${JSON.stringify(userReviews?.slice(0, 3) || [])}
Other reviews for this business: ${JSON.stringify(businessReviews?.slice(0, 5) || [])}

Analyze authenticity.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_authenticity",
            description: "Analyze review authenticity",
            parameters: {
              type: "object",
              properties: {
                score: {
                  type: "integer",
                  description: "Authenticity score from 0-100"
                },
                reasoning: {
                  type: "string",
                  description: "Explanation for the score"
                },
                red_flags: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of identified red flags"
                },
                recommendation: {
                  type: "string",
                  enum: ["approve", "flag_for_review", "reject"],
                  description: "Recommended action"
                }
              },
              required: ["score", "reasoning", "red_flags", "recommendation"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_authenticity" } }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    const analysis = JSON.parse(toolCall.function.arguments);

    // Update review with authenticity score
    await supabase
      .from('reviews')
      .update({
        authenticity_score: analysis.score,
        flagged_as_fake: analysis.score < 40
      })
      .eq('id', reviewId);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-review-authenticity:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
