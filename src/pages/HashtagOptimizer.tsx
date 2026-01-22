import { useState } from "react";
import { motion } from "framer-motion";
import { Hash, Copy, Check, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/common/LoadingSpinner";
import { useAI } from "@/hooks/useAI";

const platforms = [
  { id: "instagram", label: "Instagram", maxTags: 30 },
  { id: "twitter", label: "Twitter/X", maxTags: 5 },
  { id: "linkedin", label: "LinkedIn", maxTags: 10 },
  { id: "tiktok", label: "TikTok", maxTags: 5 },
];

export default function HashtagOptimizer() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);
  const { generate, isLoading, result, reset } = useAI();

  const handleOptimize = async () => {
    if (!content.trim()) return;
    await generate(content, { feature: "hashtags", platform });
  };

  const parsedResult = (() => {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}
    return null;
  })();

  const copyHashtags = (hashtags: string[], category: string) => {
    const text = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
    navigator.clipboard.writeText(text);
    setCopiedCategory(category);
    setTimeout(() => setCopiedCategory(null), 2000);
  };

  const renderHashtagGroup = (title: string, hashtags: string[], category: string, color: string) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-muted/30 border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${color}`}>{title}</span>
        <button
          onClick={() => copyHashtags(hashtags, category)}
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs"
        >
          {copiedCategory === category ? (
            <>
              <Check className="w-3 h-3 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy all
            </>
          )}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-1 text-xs rounded-md bg-secondary/50 text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
          >
            #{tag.replace("#", "")}
          </span>
        ))}
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <PageHeader
        icon={Hash}
        title="Hashtag Optimizer"
        description="Get the perfect mix of hashtags for maximum reach and engagement"
        badge="AI Powered"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Your Content</h3>
            <Textarea
              placeholder="Paste your post content or describe what you're posting about..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[160px] bg-muted/50 border-border focus:border-primary resize-none"
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Platform</h3>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all text-left ${
                    platform === p.id
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-xs opacity-70">Max {p.maxTags} tags</div>
                </button>
              ))}
            </div>
          </GlassCard>

          <Button
            onClick={handleOptimize}
            disabled={!content.trim() || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Hash className="w-4 h-4" />
                Optimize Hashtags
              </>
            )}
          </Button>
        </div>

        <div>
          <GlassCard className="p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Optimized Hashtags</h3>
              {result && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {isLoading ? (
              <LoadingState message="Finding the best hashtags..." />
            ) : parsedResult?.hashtags ? (
              <div className="space-y-4">
                {parsedResult.hashtags.high_reach && 
                  renderHashtagGroup("🚀 High Reach", parsedResult.hashtags.high_reach, "high", "text-primary")}
                {parsedResult.hashtags.niche && 
                  renderHashtagGroup("🎯 Niche Targeting", parsedResult.hashtags.niche, "niche", "text-accent")}
                {parsedResult.hashtags.trending && 
                  renderHashtagGroup("🔥 Trending", parsedResult.hashtags.trending, "trending", "text-success")}
                
                {parsedResult.strategy && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <p className="text-sm font-medium text-primary mb-1">💡 Strategy Tip</p>
                    <p className="text-sm text-muted-foreground">{parsedResult.strategy}</p>
                  </motion.div>
                )}
              </div>
            ) : result ? (
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Hash className="w-12 h-12 mb-4 opacity-50" />
                <p>Optimized hashtags will appear here</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
