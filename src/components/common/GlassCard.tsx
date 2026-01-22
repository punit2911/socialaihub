import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        hover && "transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow",
        className
      )}
    >
      {children}
    </div>
  );
}
