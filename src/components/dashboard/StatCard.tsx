import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
  isLoading?: boolean;
}

// Parse numeric value from string (handles "1,247", "34%", "48h", "5.2%")
function parseNumericValue(value: string | number): { num: number; prefix: string; suffix: string } {
  if (typeof value === "number") {
    return { num: value, prefix: "", suffix: "" };
  }
  
  const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (match) {
    const num = parseFloat(match[2].replace(/,/g, ""));
    return { num, prefix: match[1], suffix: match[3] };
  }
  
  return { num: 0, prefix: "", suffix: value };
}

// Format number with commas
function formatNumber(num: number, hasDecimals: boolean): string {
  if (hasDecimals) {
    return num.toFixed(1);
  }
  return Math.round(num).toLocaleString();
}

// Sparkle component
function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ 
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0],
        rotate: [0, 180],
      }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: "easeOut"
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
          fill="currentColor"
          className="text-primary"
        />
      </svg>
    </motion.div>
  );
}

// Sparkles container
function SparklesEffect({ show }: { show: boolean }) {
  const sparkles = [
    { x: 10, y: 20, delay: 0 },
    { x: 80, y: 10, delay: 0.1 },
    { x: 50, y: 5, delay: 0.05 },
    { x: 90, y: 40, delay: 0.15 },
    { x: 20, y: 50, delay: 0.08 },
    { x: 70, y: 60, delay: 0.12 },
  ];

  return (
    <AnimatePresence>
      {show && (
        <div className="absolute inset-0 overflow-visible">
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Animated counter component
function AnimatedCounter({ 
  value, 
  duration = 1.5,
  startDelay = 0.8,
  onComplete 
}: { 
  value: string | number; 
  duration?: number;
  startDelay?: number;
  onComplete?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");
  const [hasStarted, setHasStarted] = useState(false);
  
  const { num, prefix, suffix } = parseNumericValue(value);
  const hasDecimals = typeof value === "string" && value.includes(".");
  
  // Handle start delay
  useEffect(() => {
    if (!isInView || hasStarted) return;
    
    const delayTimer = setTimeout(() => {
      setHasStarted(true);
    }, startDelay * 1000);
    
    return () => clearTimeout(delayTimer);
  }, [isInView, startDelay, hasStarted]);
  
  useEffect(() => {
    if (!hasStarted) return;
    
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      
      // Easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = num * easedProgress;
      setDisplayValue(prefix + formatNumber(currentValue, hasDecimals) + suffix);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final value is exact
        setDisplayValue(typeof value === "number" ? value.toLocaleString() : value);
        onComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
  }, [hasStarted, num, prefix, suffix, duration, value, hasDecimals, onComplete]);
  
  return <span ref={ref}>{displayValue}</span>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend = "neutral",
  delay = 0,
  isLoading = false,
}: StatCardProps) {
  const [showSparkles, setShowSparkles] = useState(false);

  // Calculate dynamic duration based on number size
  const calculateDuration = () => {
    const { num } = parseNumericValue(value);
    if (num >= 1000) return 5.0;      // Large numbers (1,247) - slowest
    if (num >= 100) return 4.5;       // Medium-large (like percentages over 100)
    if (num >= 10) return 4.0;        // Medium numbers (34%, 48h)
    return 3.5;                        // Small numbers (5.2%)
  };

  const countDuration = calculateDuration();

  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  const handleCountComplete = () => {
    setShowSparkles(true);
    // Hide sparkles after animation
    setTimeout(() => setShowSparkles(false), 800);
  };

  return (
    <motion.div
      className="stat-card group cursor-pointer relative overflow-hidden"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Sparkles effect */}
      <SparklesEffect show={showSparkles} />

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Glow pulse on complete */}
      <AnimatePresence>
        {showSparkles && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between relative">
        <motion.div 
          className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </motion.div>
        {change && (
          <motion.span 
            className={cn("text-xs font-medium", trendColors[trend])}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {trendIcons[trend]} {change}
          </motion.span>
        )}
      </div>
      <div className="relative">
        {isLoading ? (
          <Skeleton className="h-8 w-20 mb-1" />
        ) : (
          <motion.p 
            className="text-2xl font-display font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatedCounter value={value} duration={countDuration} onComplete={handleCountComplete} />
          </motion.p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
