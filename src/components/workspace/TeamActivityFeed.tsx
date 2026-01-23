import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Image, 
  Hash,
  UserPlus,
  Settings,
  FileText,
  Activity
} from "lucide-react";
import { useWorkspace, TeamActivity } from "@/contexts/WorkspaceContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassCard } from "@/components/common/GlassCard";

const actionIcons: Record<string, React.ElementType> = {
  generated_content: Sparkles,
  scheduled_content: Calendar,
  analyzed_sentiment: BarChart3,
  created_image: Image,
  optimized_hashtags: Hash,
  joined_workspace: UserPlus,
  updated_workspace: Settings,
  generated_post: FileText,
};

const actionLabels: Record<string, string> = {
  generated_content: 'generated content',
  scheduled_content: 'scheduled content',
  analyzed_sentiment: 'analyzed sentiment',
  created_image: 'created an image',
  optimized_hashtags: 'optimized hashtags',
  joined_workspace: 'joined the workspace',
  updated_workspace: 'updated workspace settings',
  generated_post: 'generated a post',
};

interface TeamActivityFeedProps {
  maxItems?: number;
  compact?: boolean;
}

export function TeamActivityFeed({ maxItems = 10, compact = false }: TeamActivityFeedProps) {
  const { activities, members } = useWorkspace();

  const displayActivities = activities.slice(0, maxItems);

  const getMemberInfo = (userId: string) => {
    const member = members.find(m => m.user_id === userId);
    return {
      name: member?.profile?.display_name || 'Team Member',
      avatar: member?.profile?.avatar_url || null,
    };
  };

  const getActionIcon = (action: string) => {
    return actionIcons[action] || Activity;
  };

  const getActionLabel = (action: string) => {
    return actionLabels[action] || action.replace(/_/g, ' ');
  };

  if (displayActivities.length === 0) {
    return (
      <GlassCard className={compact ? "p-3" : "p-4"}>
        <div className="text-center py-6 text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No team activity yet</p>
          <p className="text-xs mt-1">Activities will appear here as your team works</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={compact ? "p-3" : "p-4"}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Team Activity</h3>
      </div>
      <ScrollArea className={compact ? "h-[200px]" : "h-[300px]"}>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {displayActivities.map((activity, index) => {
              const memberInfo = getMemberInfo(activity.user_id);
              const ActionIcon = getActionIcon(activity.action);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={memberInfo.avatar || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {memberInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{memberInfo.name}</span>
                      <span className="text-muted-foreground"> {getActionLabel(activity.action)}</span>
                    </p>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {JSON.stringify(activity.details)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ActionIcon className="w-3 h-3 text-primary" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
