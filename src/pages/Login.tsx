import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Chrome, Sparkles, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const features = [
    { icon: Sparkles, text: "AI Content Generation" },
    { icon: Zap, text: "Smart Hashtag Optimization" },
    { icon: Brain, text: "Sentiment Analysis" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-card/30 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo and title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 mb-4 relative">
              <Brain className="h-10 w-10 text-primary" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              SocialAI Hub
            </h1>
            <p className="text-muted-foreground mt-2">
              Your AI-powered social media assistant
            </p>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-3 mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 text-muted-foreground"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Google sign in button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <Button
              onClick={handleGoogleSignIn}
              className="w-full h-12 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/20 group"
            >
              <Chrome className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Continue with Google
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </div>

        {/* Created by credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Created by{" "}
          <motion.span 
            className="text-primary font-medium inline-block cursor-default"
            whileHover={{ scale: 1.1, textShadow: "0 0 12px hsl(var(--primary))" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Punit Gavali
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
}
