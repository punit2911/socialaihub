import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Crown, 
  Edit3, 
  Eye, 
  MoreHorizontal, 
  UserMinus,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace, WorkspaceRole } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlassCard } from "@/components/common/GlassCard";
import { ScrollArea } from "@/components/ui/scroll-area";

const roleIcons: Record<WorkspaceRole, React.ElementType> = {
  owner: Crown,
  editor: Edit3,
  viewer: Eye,
};

const roleColors: Record<WorkspaceRole, string> = {
  owner: "text-amber-500 bg-amber-500/10",
  editor: "text-primary bg-primary/10",
  viewer: "text-muted-foreground bg-muted",
};

interface TeamMembersListProps {
  compact?: boolean;
}

export function TeamMembersList({ compact = false }: TeamMembersListProps) {
  const { members, isOwner, updateMemberRole, removeMember } = useWorkspace();
  const { user } = useAuth();

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    await updateMemberRole(memberId, newRole);
  };

  const handleRemove = async (memberId: string) => {
    await removeMember(memberId);
  };

  if (members.length === 0) {
    return (
      <GlassCard className={compact ? "p-3" : "p-4"}>
        <div className="text-center py-6 text-muted-foreground">
          <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No team members yet</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={compact ? "p-3" : "p-4"}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Team Members</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {members.length}
        </span>
      </div>
      <ScrollArea className={compact ? "h-[200px]" : "h-[300px]"}>
        <div className="space-y-2">
          {members.map((member, index) => {
            const RoleIcon = roleIcons[member.role];
            const isCurrentUser = member.user_id === user?.id;
            const canManage = isOwner && !isCurrentUser && member.role !== 'owner';

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {(member.profile?.display_name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.profile?.display_name || 'Team Member'}
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground ml-1">(you)</span>
                    )}
                  </p>
                  <div className={cn(
                    "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded capitalize",
                    roleColors[member.role]
                  )}>
                    <RoleIcon className="w-3 h-3" />
                    {member.role}
                  </div>
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'editor')}
                        disabled={member.role === 'editor'}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Make Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'viewer')}
                        disabled={member.role === 'viewer'}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Make Viewer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemove(member.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove from workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
