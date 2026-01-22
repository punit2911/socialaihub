import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/common/LoadingSpinner";
import { useAI } from "@/hooks/useAI";

const platforms = [
  { id: "twitter", label: "Twitter/X", emoji: "🐦" },
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "linkedin", label: "LinkedIn", emoji: "💼" },
  { id: "facebook", label: "Facebook", emoji: "👥" },
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
];

const tones = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "humorous", label: "Humorous" },
  { id: "inspirational", label: "Inspirational" },
  { id: "educational", label: "Educational" },
];

export default function ContentGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [tone, setTone] = useState("professional");
  const [copied, setCopied] = useState<number | null>(null);
  const { generate, isLoading, result, reset } = useAI();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await generate(topic, { feature: "generate", platform, tone });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  // Parse the result to extract posts
  const parsedResult = (() => {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Return raw result if parsing fails
    }
    return null;
  })();

  return (
    <DashboardLayout>
      <PageHeader
        icon={Sparkles}
        title="Content Generator"
        description="Create engaging social media posts optimized for any platform"
        badge="AI Powered"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input section */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">What do you want to post about?</h3>
            <Textarea
              placeholder="e.g., Launching our new product feature that helps teams collaborate better..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[120px] bg-muted/50 border-border focus:border-primary resize-none"
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Select Platform</h3>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    platform === p.id
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Tone of Voice</h3>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tone === t.id
                      ? "bg-accent text-accent-foreground shadow-glow-accent"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </GlassCard>

          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>

        {/* Output section */}
        <div>
          <GlassCard className="p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Generated Content</h3>
              {result && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {isLoading ? (
              <LoadingState message="Crafting your content..." />
            ) : parsedResult?.posts ? (
              <div className="space-y-4">
                {parsedResult.posts.map((post: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className="text-xs text-accent font-medium px-2 py-0.5 bg-accent/10 rounded">
                        {post.angle || `Option ${index + 1}`}
                      </span>
                      <button
                        onClick={() => copyToClipboard(post.content, index)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {copied === index ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm mb-2">{post.content}</p>
                    {post.tips && (
                      <p className="text-xs text-muted-foreground italic">
                        💡 {post.tips}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : result ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                <p>Your generated content will appear here</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
