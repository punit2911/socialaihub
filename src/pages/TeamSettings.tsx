import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { WorkspaceSettings } from "@/components/workspace/WorkspaceSettings";
import { TeamMembersList } from "@/components/workspace/TeamMembersList";
import { TeamActivityFeed } from "@/components/workspace/TeamActivityFeed";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function TeamSettings() {
  const { currentWorkspace, loading } = useWorkspace();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!currentWorkspace) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
          <p className="text-muted-foreground">
            Create or select a workspace to manage team settings.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Team & Workspace"
        description="Manage your workspace settings, team members, and permissions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main settings column */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WorkspaceSettings />
        </motion.div>

        {/* Sidebar with members and activity */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TeamMembersList />
          <TeamActivityFeed compact />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
