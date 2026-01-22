import { motion } from "framer-motion";
import {
  Sparkles,
  Hash,
  Image,
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { GlassCard } from "@/components/common/GlassCard";

const features = [
  {
    icon: Sparkles,
    title: "Content Generator",
    description: "Create engaging posts for any platform with AI-powered suggestions",
    path: "/generate",
    gradient: "primary" as const,
  },
  {
    icon: Hash,
    title: "Hashtag Optimizer",
    description: "Get the perfect mix of trending and niche hashtags",
    path: "/hashtags",
    gradient: "accent" as const,
  },
  {
    icon: Image,
    title: "Image Creator",
    description: "Generate stunning visuals for your social media posts",
    path: "/images",
    gradient: "success" as const,
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    description: "Understand how your audience feels about your content",
    path: "/sentiment",
    gradient: "primary" as const,
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "AI-powered scheduling for maximum engagement",
    path: "/calendar",
    gradient: "accent" as const,
  },
  {
    icon: Target,
    title: "Competitor Analysis",
    description: "Track and analyze your competitors' strategies",
    path: "/competitors",
    gradient: "success" as const,
  },
];

const stats = [
  { icon: TrendingUp, label: "Posts Generated", value: "1,247", change: "+12%", trend: "up" as const },
  { icon: Users, label: "Reach Increase", value: "34%", change: "+8%", trend: "up" as const },
  { icon: MessageSquare, label: "Engagement Rate", value: "5.2%", change: "+2.1%", trend: "up" as const },
  { icon: Zap, label: "Time Saved", value: "48h", change: "this month", trend: "neutral" as const },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3">
          Welcome to{" "}
          <span className="text-primary text-glow">SocialAI Hub</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your AI-powered command center for social media marketing. Create, analyze, and optimize your content with cutting-edge AI.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Quick tip */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              Start with the Content Generator to create your base posts, then optimize with Hashtag suggestions for maximum reach!
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Features grid */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">AI Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.path}
              {...feature}
              delay={0.5 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
