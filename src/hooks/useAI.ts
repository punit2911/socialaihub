import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AIFeature = "generate" | "hashtags" | "sentiment" | "calendar" | "competitors" | "image";

interface UseAIOptions {
  feature: AIFeature;
  platform?: string;
  tone?: string;
  context?: string;
}

interface ImageResult {
  image: string;
  description: string;
  success: boolean;
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);

  const generate = useCallback(async (prompt: string, options: UseAIOptions) => {
    setIsLoading(true);
    setResult("");
    setImageResult(null);

    try {
      // For image generation, use invoke (non-streaming)
      if (options.feature === "image") {
        const { data, error } = await supabase.functions.invoke("ai-marketing", {
          body: {
            feature: options.feature,
            prompt,
            platform: options.platform,
            tone: options.tone,
            context: options.context,
          },
        });

        if (error) {
          throw new Error(error.message || "AI request failed");
        }

        if (data?.error) {
          if (data.error.includes("Rate limit")) {
            toast({
              title: "Rate Limited",
              description: "Too many requests. Please wait a moment and try again.",
              variant: "destructive",
            });
            throw new Error("Rate limited");
          }
          if (data.error.includes("Usage limit") || data.error.includes("Payment")) {
            toast({
              title: "Usage Limit",
              description: "AI usage limit reached. Please add credits to continue.",
              variant: "destructive",
            });
            throw new Error("Usage limit");
          }
          throw new Error(data.error);
        }

        setImageResult(data as ImageResult);
        setIsLoading(false);
        return data;
      }

      // For text features, use fetch for streaming
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Get the Supabase URL from the client
      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/ai-marketing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken || anonKey}`,
            "apikey": anonKey,
          },
          body: JSON.stringify({
            feature: options.feature,
            prompt,
            platform: options.platform,
            tone: options.tone,
            context: options.context,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "AI request failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response might not be JSON
        }
        
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
          throw new Error("Rate limited");
        }
        if (response.status === 402) {
          toast({
            title: "Usage Limit",
            description: "AI usage limit reached. Please add credits to continue.",
            variant: "destructive",
          });
          throw new Error("Usage limit");
        }
        throw new Error(errorMessage);
      }

      // Handle streaming
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setResult(fullContent);
            }
          } catch {
            // Partial JSON, put it back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);
      return fullContent;
    } catch (error) {
      console.error("AI error:", error);
      setIsLoading(false);
      if (error instanceof Error && !["Rate limited", "Usage limit"].includes(error.message)) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate content",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setResult("");
    setImageResult(null);
    setIsLoading(false);
  }, []);

  return {
    generate,
    isLoading,
    result,
    imageResult,
    reset,
  };
}
