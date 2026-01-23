import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  feature: "generate" | "hashtags" | "sentiment" | "calendar" | "competitors" | "image";
  prompt: string;
  platform?: string;
  tone?: string;
  context?: string;
}

const systemPrompts: Record<string, string> = {
  generate: `You are an expert social media content creator. Generate engaging, platform-optimized content.
    - For Twitter/X: Keep under 280 characters, use hooks and CTAs
    - For Instagram: Focus on storytelling, include emoji suggestions
    - For LinkedIn: Professional tone, thought leadership focus
    - For Facebook: Conversational, community-building
    - For TikTok: Trendy, hook-first, younger audience
    
    Always provide 3 variations with different angles. Format as JSON with structure:
    { "posts": [{ "content": "...", "angle": "...", "tips": "..." }] }`,
    
  hashtags: `You are a hashtag optimization expert. Analyze the given content and suggest optimal hashtags.
    Consider:
    - Trending vs evergreen hashtags
    - Mix of broad reach and niche targeting
    - Platform-specific best practices
    
    Return JSON: { "hashtags": { "high_reach": [...], "niche": [...], "trending": [...] }, "strategy": "..." }`,
    
  sentiment: `You are a sentiment analysis expert for social media. Analyze the given text/content and provide:
    - Overall sentiment (positive/negative/neutral) with confidence score
    - Emotional breakdown
    - Key themes and topics
    - Engagement prediction
    - Recommendations for improvement
    
    Return JSON: { "sentiment": "...", "confidence": 0.0, "emotions": {...}, "themes": [...], "recommendations": [...] }`,
    
  calendar: `You are a social media strategist. Create a content calendar based on the user's goals.
    Consider:
    - Best posting times per platform
    - Content mix (educational, entertaining, promotional)
    - Trending topics and seasonal events
    - Engagement patterns
    
    Return JSON: { "schedule": [{ "day": "...", "time": "...", "platform": "...", "content_type": "...", "topic": "..." }], "strategy_tips": [...] }`,
    
  competitors: `You are a competitive analysis expert. Analyze the competitor information provided and give insights on:
    - Content strategy patterns
    - Engagement tactics
    - Posting frequency
    - Content themes that work well
    - Opportunities and gaps
    
    Return JSON: { "analysis": { "strengths": [...], "weaknesses": [...], "opportunities": [...], "content_patterns": [...] }, "recommendations": [...] }`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !data?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = data.claims.sub;
    console.log(`Authenticated request from user: ${userId}`);

    const { feature, prompt, platform, tone, context }: AIRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userMessage = prompt;
    if (platform) userMessage += `\n\nPlatform: ${platform}`;
    if (tone) userMessage += `\nTone: ${tone}`;
    if (context) userMessage += `\nAdditional context: ${context}`;

    // For image generation, use a different model
    if (feature === "image") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { 
              role: "user", 
              content: `Create a professional social media graphic for: ${prompt}. 
                       Style: Modern, clean, suitable for ${platform || 'social media'}.
                       Make it visually striking and shareable.`
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI image error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "Failed to generate image" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      const textContent = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ 
        image: imageUrl,
        description: textContent,
        success: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For text-based features, use streaming
    const systemPrompt = systemPrompts[feature] || systemPrompts.generate;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI function error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
