import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, RefreshCw, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/common/LoadingSpinner";
import { useAI } from "@/hooks/useAI";

export default function SentimentAnalysis() {
  const [content, setContent] = useState("");
  const { generate, isLoading, result, reset } = useAI();

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    await generate(content, { feature: "sentiment" });
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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return <ThumbsUp className="w-8 h-8 text-success" />;
      case "negative":
        return <ThumbsDown className="w-8 h-8 text-destructive" />;
      default:
        return <Meh className="w-8 h-8 text-warning" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-warning";
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        icon={BarChart3}
        title="Sentiment Analysis"
        description="Understand the emotional tone and impact of your content"
        badge="AI Powered"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Content to Analyze</h3>
            <Textarea
              placeholder="Paste your social media post, comments, or any text you want to analyze..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] bg-muted/50 border-border focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You can analyze posts, comments, reviews, or any text content
            </p>
          </GlassCard>

          <Button
            onClick={handleAnalyze}
            disabled={!content.trim() || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                Analyze Sentiment
              </>
            )}
          </Button>
        </div>

        <div>
          <GlassCard className="p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Analysis Results</h3>
              {result && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {isLoading ? (
              <LoadingState message="Analyzing sentiment..." />
            ) : parsedResult ? (
              <div className="space-y-6">
                {/* Main sentiment */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border"
                >
                  {getSentimentIcon(parsedResult.sentiment)}
                  <div>
                    <p className={`text-2xl font-display font-bold capitalize ${getSentimentColor(parsedResult.sentiment)}`}>
                      {parsedResult.sentiment}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {parsedResult.confidence 
                        ? `${Math.round(parsedResult.confidence * 100)}% confidence`
                        : "Overall sentiment"}
                    </p>
                  </div>
                </motion.div>

                {/* Emotions */}
                {parsedResult.emotions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className="text-sm font-medium mb-3">Emotional Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(parsedResult.emotions).map(([emotion, value]: [string, any]) => (
                        <div key={emotion} className="p-2 rounded bg-muted/20">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize">{emotion}</span>
                            <span>{typeof value === 'number' ? `${Math.round(value * 100)}%` : value}</span>
                          </div>
                          {typeof value === 'number' && (
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${value * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Themes */}
                {parsedResult.themes && parsedResult.themes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-sm font-medium mb-2">Key Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedResult.themes.map((theme: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-md bg-accent/20 text-accent"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recommendations */}
                {parsedResult.recommendations && parsedResult.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <h4 className="text-sm font-medium text-primary mb-2">💡 Recommendations</h4>
                    <ul className="space-y-1">
                      {parsedResult.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            ) : result ? (
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                <p>Analysis results will appear here</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
