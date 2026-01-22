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

export function FeatureCard({
  icon: Icon,
  title,
  description,
  path,
  gradient = "primary",
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link to={path} className="block group">
        <div className="feature-card h-full">
          {/* Gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl",
              gradientStyles[gradient]
            )}
          />
          
          {/* Icon */}
          <div className="relative mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className={cn("w-6 h-6", iconStyles[gradient])} />
            </div>
          </div>
          
          {/* Content */}
          <div className="relative">
            <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          
          {/* Arrow indicator */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-primary"
            >
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
