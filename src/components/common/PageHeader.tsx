import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  badge?: string;
}

export function PageHeader({ icon: Icon, title, description, badge }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent/20 text-accent">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      )}
    </motion.div>
  );
}
