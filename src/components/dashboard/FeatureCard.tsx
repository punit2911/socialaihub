import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  gradient?: "primary" | "accent" | "success";
  delay?: number;
}

const gradientStyles = {
  primary: "from-primary/20 to-transparent",
  accent: "from-accent/20 to-transparent",
  success: "from-success/20 to-transparent",
};

const iconStyles = {
  primary: "text-primary drop-shadow-[0_0_10px_hsl(180_100%_50%)]",
  accent: "text-accent drop-shadow-[0_0_10px_hsl(320_100%_60%)]",
  success: "text-success drop-shadow-[0_0_10px_hsl(145_80%_45%)]",
};

const borderGlowStyles = {
  primary: "group-hover:shadow-[0_0_30px_hsl(180_100%_50%_/_0.2)]",
  accent: "group-hover:shadow-[0_0_30px_hsl(320_100%_60%_/_0.2)]",
  success: "group-hover:shadow-[0_0_30px_hsl(145_80%_45%_/_0.2)]",
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  path,
  gradient = "primary",
  delay = 0,
}: FeatureCardProps) {
  return (
    <Link to={path} className="block group">
      <div className={cn(
        "feature-card h-full relative overflow-hidden transition-all duration-500",
        borderGlowStyles[gradient]
      )}>
        {/* Animated gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl",
            gradientStyles[gradient]
          )}
        />
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        
        {/* Icon with pulse ring */}
        <div className="relative mb-4">
          <motion.div 
            className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className={cn("w-6 h-6 transition-all duration-300", iconStyles[gradient])} />
            {/* Pulse ring on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100">
              <div className={cn(
                "absolute inset-0 rounded-xl animate-pulse-ring",
                gradient === "primary" && "bg-primary/30",
                gradient === "accent" && "bg-accent/30",
                gradient === "success" && "bg-success/30"
              )} />
            </div>
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="relative">
          <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors duration-300">
            {description}
          </p>
        </div>
        
        {/* Arrow indicator with animation */}
        <motion.div 
          className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-primary"
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <path
              d="M4 10H16M16 10L11 5M16 10L11 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>

        {/* Corner accent */}
        <div className={cn(
          "absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl",
          gradient === "primary" && "bg-primary",
          gradient === "accent" && "bg-accent",
          gradient === "success" && "bg-success"
        )} />
      </div>
    </Link>
  );
}
