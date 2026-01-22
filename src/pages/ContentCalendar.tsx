import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, RefreshCw, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/common/LoadingSpinner";
import { useAI } from "@/hooks/useAI";

const contentGoals = [
  { id: "awareness", label: "Brand Awareness" },
  { id: "engagement", label: "Boost Engagement" },
  { id: "traffic", label: "Drive Traffic" },
  { id: "sales", label: "Increase Sales" },
  { id: "community", label: "Build Community" },
];

const platformColors: Record<string, string> = {
  twitter: "bg-blue-500/20 text-blue-400",
  instagram: "bg-pink-500/20 text-pink-400",
  linkedin: "bg-blue-600/20 text-blue-300",
  facebook: "bg-indigo-500/20 text-indigo-400",
  tiktok: "bg-purple-500/20 text-purple-400",
};

export default function ContentCalendar() {
  const [goal, setGoal] = useState("engagement");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");
  const { generate, isLoading, result, reset } = useAI();

  const handleGenerate = async () => {
    const prompt = `Create a weekly content calendar for a ${industry || 'general'} business.
    Goal: ${contentGoals.find(g => g.id === goal)?.label || goal}
    ${notes ? `Additional notes: ${notes}` : ''}
    Include posts for Twitter, Instagram, LinkedIn, and Facebook.`;
    
    await generate(prompt, { feature: "calendar" });
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

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <DashboardLayout>
      <PageHeader
        icon={CalendarIcon}
        title="Content Calendar"
        description="AI-powered content scheduling for maximum engagement"
        badge="AI Powered"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input section */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Your Industry</h3>
            <Input
              placeholder="e.g., SaaS, E-commerce, Fitness..."
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary"
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Content Goal</h3>
            <div className="space-y-2">
              {contentGoals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`w-full p-3 rounded-lg text-sm font-medium text-left transition-all ${
                    goal === g.id
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Additional Notes</h3>
            <Textarea
              placeholder="Any specific themes, campaigns, or events to include..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] bg-muted/50 border-border focus:border-primary resize-none"
            />
          </GlassCard>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
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
                <CalendarIcon className="w-4 h-4" />
                Generate Calendar
              </>
            )}
          </Button>
        </div>

        {/* Calendar view */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold">Weekly Schedule</h3>
              {result && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {isLoading ? (
              <LoadingState message="Creating your content calendar..." />
            ) : parsedResult?.schedule ? (
              <div className="space-y-4">
                {days.map((day) => {
                  const dayPosts = parsedResult.schedule.filter(
                    (item: any) => item.day?.toLowerCase() === day.toLowerCase()
                  );
                  
                  if (dayPosts.length === 0) return null;

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-l-2 border-primary/30 pl-4"
                    >
                      <h4 className="font-medium text-primary mb-2">{day}</h4>
                      <div className="space-y-2">
                        {dayPosts.map((post: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-muted/30 border border-border"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                platformColors[post.platform?.toLowerCase()] || "bg-muted text-muted-foreground"
                              }`}>
                                {post.platform}
                              </span>
                              {post.time && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {post.time}
                                </span>
                              )}
                              {post.content_type && (
                                <span className="text-xs text-accent">
                                  {post.content_type}
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{post.topic}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {parsedResult.strategy_tips && parsedResult.strategy_tips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <h4 className="text-sm font-medium text-primary mb-2">💡 Strategy Tips</h4>
                    <ul className="space-y-1">
                      {parsedResult.strategy_tips.map((tip: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {tip}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            ) : result ? (
              <pre className="whitespace-pre-wrap text-sm overflow-auto">{result}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <CalendarIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>Your content calendar will appear here</p>
                <p className="text-xs mt-2">Set your goals and generate a weekly plan</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
