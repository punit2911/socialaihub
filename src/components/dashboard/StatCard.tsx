import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
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

// Animated counter component
function AnimatedCounter({ 
  value, 
  duration = 1.5,
  startDelay = 0.8,
}: { 
  value: string | number; 
  duration?: number;
  startDelay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
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
        setIsComplete(true);
      }
    };
    
    requestAnimationFrame(animate);
  }, [hasStarted, num, prefix, suffix, duration, value, hasDecimals]);
  
  return (
    <motion.span 
      ref={ref}
      animate={isComplete ? { 
        scale: [1, 1.08, 0.95, 1.02, 1],
      } : {}}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
      }}
    >
      {displayValue}
    </motion.span>
  );
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

  return (
    <motion.div
      className="stat-card group cursor-pointer relative overflow-hidden"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

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
            <AnimatedCounter value={value} duration={countDuration} />
          </motion.p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
