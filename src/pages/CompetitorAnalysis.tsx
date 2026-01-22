import { useState } from "react";
import { motion } from "framer-motion";
import { Target, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/common/LoadingSpinner";
import { useAI } from "@/hooks/useAI";

export default function CompetitorAnalysis() {
  const [competitor, setCompetitor] = useState("");
  const [details, setDetails] = useState("");
  const { generate, isLoading, result, reset } = useAI();

  const handleAnalyze = async () => {
    if (!competitor.trim()) return;
    
    const prompt = `Analyze this competitor: ${competitor}
    ${details ? `Additional details: ${details}` : ''}
    Focus on their social media strategy, content patterns, and engagement tactics.`;
    
    await generate(prompt, { feature: "competitors" });
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

  const renderList = (items: string[], icon: React.ReactNode, title: string, color: string) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-muted/30 border border-border"
    >
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className={`font-medium ${color}`}>{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <PageHeader
        icon={Target}
        title="Competitor Analysis"
        description="Analyze competitors' social media strategies and find opportunities"
        badge="AI Powered"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Competitor Name or URL</h3>
            <Input
              placeholder="e.g., CompanyName or @handle"
              value={competitor}
              onChange={(e) => setCompetitor(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary"
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">What You Know About Them</h3>
            <Textarea
              placeholder="Share any information you have: their platforms, posting frequency, content types, target audience, recent campaigns..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[160px] bg-muted/50 border-border focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              The more context you provide, the better the analysis
            </p>
          </GlassCard>

          <Button
            onClick={handleAnalyze}
            disabled={!competitor.trim() || isLoading}
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
                <Target className="w-4 h-4" />
                Analyze Competitor
              </>
            )}
          </Button>
        </div>

        <div>
          <GlassCard className="p-6 min-h-[500px]">
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
              <LoadingState message="Analyzing competitor strategy..." />
            ) : parsedResult?.analysis ? (
              <div className="space-y-4">
                {parsedResult.analysis.strengths?.length > 0 && 
                  renderList(
                    parsedResult.analysis.strengths,
                    <TrendingUp className="w-5 h-5 text-success" />,
                    "Strengths",
                    "text-success"
                  )}
                
                {parsedResult.analysis.weaknesses?.length > 0 && 
                  renderList(
                    parsedResult.analysis.weaknesses,
                    <TrendingDown className="w-5 h-5 text-destructive" />,
                    "Weaknesses",
                    "text-destructive"
                  )}
                
                {parsedResult.analysis.opportunities?.length > 0 && 
                  renderList(
                    parsedResult.analysis.opportunities,
                    <AlertCircle className="w-5 h-5 text-warning" />,
                    "Opportunities for You",
                    "text-warning"
                  )}

                {parsedResult.analysis.content_patterns?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-sm font-medium mb-2">Content Patterns</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedResult.analysis.content_patterns.map((pattern: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-md bg-primary/20 text-primary"
                        >
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {parsedResult.recommendations?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg bg-accent/10 border border-accent/20"
                  >
                    <h4 className="text-sm font-medium text-accent mb-2">🎯 Action Items</h4>
                    <ul className="space-y-1">
                      {parsedResult.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {i + 1}. {rec}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            ) : result ? (
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Target className="w-12 h-12 mb-4 opacity-50" />
                <p>Competitor analysis will appear here</p>
                <p className="text-xs mt-2">Enter a competitor to analyze</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
