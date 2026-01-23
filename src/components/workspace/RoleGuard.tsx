import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock, Eye } from "lucide-react";
import { useWorkspace, WorkspaceRole } from "@/contexts/WorkspaceContext";
import { GlassCard } from "@/components/common/GlassCard";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: WorkspaceRole[];
  fallback?: ReactNode;
  showMessage?: boolean;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  showMessage = true 
}: RoleGuardProps) {
  const { currentRole, loading } = useWorkspace();

  if (loading) {
    return null;
  }

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showMessage) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            {currentRole === 'viewer' ? (
              <Eye className="w-8 h-8 text-muted-foreground" />
            ) : (
              <Lock className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {currentRole === 'viewer' ? (
              "As a viewer, you can see analytics and content but cannot create or edit. Ask the workspace owner to upgrade your role."
            ) : (
              "You don't have permission to access this feature. Contact your workspace administrator."
            )}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            Required role: {allowedRoles.join(' or ')}
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return <>{children}</>;
}

// Hook for conditional rendering based on role
export function useRoleCheck() {
  const { currentRole, canEdit, isOwner } = useWorkspace();

  const hasRole = (roles: WorkspaceRole[]) => {
    return currentRole ? roles.includes(currentRole) : false;
  };

  return {
    currentRole,
    canEdit,
    isOwner,
    hasRole,
    isViewer: currentRole === 'viewer',
    isEditor: currentRole === 'editor',
  };
}
