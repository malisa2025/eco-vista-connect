import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { jobTitle, industry, experienceLevel, type } = await req.json();

    if (!jobTitle) {
      return new Response(
        JSON.stringify({ error: 'Job title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = `You are an expert HR professional helping create job postings for Ghanaian businesses. 
Generate professional, clear, and engaging content that is specific to the Ghanaian job market.
Use Ghana Cedis (GHS) for salary references when applicable.
Consider local business culture and expectations.`;

    let userPrompt = '';

    switch (type) {
      case 'description':
        userPrompt = `Write a compelling job description for a ${jobTitle} position in the ${industry} industry requiring ${experienceLevel} experience level. 
Include what the role involves and what makes it exciting. Keep it 2-3 paragraphs.`;
        break;
      
      case 'requirements':
        userPrompt = `List the key requirements for a ${jobTitle} position in the ${industry} industry requiring ${experienceLevel} experience level. 
Format as a bullet-point list. Include education, skills, experience, and any certifications. Be specific but realistic for the Ghanaian market.`;
        break;
      
      case 'responsibilities':
        userPrompt = `List the main responsibilities for a ${jobTitle} position in the ${industry} industry requiring ${experienceLevel} experience level. 
Format as a bullet-point list. Include day-to-day tasks and key deliverables.`;
        break;
      
      case 'full':
      default:
        userPrompt = `Create a complete job posting for a ${jobTitle} position in the ${industry} industry requiring ${experienceLevel} experience level.
Include:
1. A compelling job description (2-3 paragraphs)
2. Key requirements (bullet points)
3. Main responsibilities (bullet points)

Format the response as JSON with keys: description, requirements (array), responsibilities (array)`;
        break;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI Gateway error:', errorData);
      throw new Error(`AI Gateway returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    // For 'full' type, try to parse as JSON
    if (type === 'full') {
      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify(parsed),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        // If parsing fails, return as text
        return new Response(
          JSON.stringify({ content }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For other types, return the content as-is
    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating job content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});