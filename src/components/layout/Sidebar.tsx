import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Hash,
  Image,
  BarChart3,
  Calendar,
  Target,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Sparkles, label: "Content Generator", path: "/generate", badge: "AI" },
  { icon: Hash, label: "Hashtag Optimizer", path: "/hashtags", badge: "AI" },
  { icon: Image, label: "Image Creator", path: "/images", badge: "AI" },
  { icon: BarChart3, label: "Sentiment Analysis", path: "/sentiment", badge: "AI" },
  { icon: Calendar, label: "Content Calendar", path: "/calendar", badge: "AI" },
  { icon: Target, label: "Competitor Analysis", path: "/competitors", badge: "AI" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo with animation */}
      <div className="p-6 flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center relative"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Zap className="w-6 h-6 text-primary" />
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-display text-xl font-bold text-glow">
                SocialAI Hub
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation with stagger animation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "nav-active bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-all relative z-10",
                      isActive && "text-primary drop-shadow-[0_0_8px_hsl(180_100%_50%)]"
                    )}
                  />
                </motion.div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isCollapsed && item.badge && (
                  <motion.span 
                    className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent/20 text-accent relative z-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        {userName && !isCollapsed && (
          <motion.div 
            className="mb-3 px-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium truncate">{userName}</p>
          </motion.div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-destructive group",
            isCollapsed && "justify-center"
          )}
          onClick={handleLogout}
        >
          <motion.div
            whileHover={{ x: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <LogOut className="w-5 h-5" />
          </motion.div>
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

      {/* Collapse toggle (desktop only) */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-secondary border border-border items-center justify-center hover:bg-muted transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Menu className={cn("w-3 h-3 transition-transform duration-300", isCollapsed && "rotate-180")} />
      </motion.button>
    </div>
  );

  return (
    <>
      {/* Mobile menu button - only show when sidebar is closed */}
      <AnimatePresence>
        {!isMobileOpen && (
          <motion.button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-card shadow-lg border border-border/50"
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] glass-card z-50 border-r border-border"
          >
            <motion.button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 glass-card z-40 border-r border-border"
      >
        <SidebarContent />
      </motion.aside>

      {/* Spacer for content */}
      <motion.div
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:block flex-shrink-0"
      />
    </>
  );
}
