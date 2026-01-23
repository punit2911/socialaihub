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

const statsData = [
  { icon: TrendingUp, label: "Posts Generated", value: "1,247", change: "+12%", trend: "up" as const },
  { icon: Users, label: "Reach Increase", value: "34%", change: "+8%", trend: "up" as const },
  { icon: MessageSquare, label: "Engagement Rate", value: "5.2%", change: "+2.1%", trend: "up" as const },
  { icon: Zap, label: "Time Saved", value: "48h", change: "this month", trend: "neutral" as const },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-success/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 relative"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"
        />
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3">
          Welcome to{" "}
          <motion.span 
            className="text-primary text-glow inline-block"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
          >
            SocialAI Hub
          </motion.span>
        </h1>
        <motion.p 
          className="text-lg text-muted-foreground max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Your AI-powered command center for social media marketing. Create, analyze, and optimize your content with cutting-edge AI.
        </motion.p>
      </motion.div>

      {/* Stats with stagger animation */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statsData.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <StatCard {...stat} delay={0} />
          </motion.div>
        ))}
      </motion.div>

      {/* Quick tip with slide animation */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <GlassCard className="p-4 flex items-center gap-4 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <motion.div 
            className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 relative"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Zap className="w-5 h-5 text-accent" />
            <div className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
          </motion.div>
          <div className="flex-1 relative">
            <p className="text-sm font-medium">Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              Start with the Content Generator to create your base posts, then optimize with Hashtag suggestions for maximum reach!
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Features grid with stagger */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <motion.h2 
          className="font-display text-xl font-semibold mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          AI Features
        </motion.h2>
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FeatureCard {...feature} delay={0} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer credit */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-16 pt-8 border-t border-border/50"
      >
        <motion.div 
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-default"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <span>Created by</span>
          <motion.span 
            className="font-display font-semibold text-primary text-glow relative"
            whileHover={{ scale: 1.1, textShadow: "0 0 12px hsl(var(--primary))" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Punit Gavali
            <motion.span
              className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-primary origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.span>
        </motion.div>
      </motion.footer>
    </DashboardLayout>
  );
}
