import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type WorkspaceRole = "owner" | "editor" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  invite_code: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface TeamActivity {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  details: unknown;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentRole: WorkspaceRole | null;
  members: WorkspaceMember[];
  activities: TeamActivity[];
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<boolean>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  inviteMember: (workspaceId: string, userId: string, role: WorkspaceRole) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  joinByInviteCode: (code: string) => Promise<boolean>;
  regenerateInviteCode: (workspaceId: string) => Promise<string | null>;
  logActivity: (action: string, details?: Record<string, unknown>) => Promise<void>;
  canEdit: boolean;
  isOwner: boolean;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [currentRole, setCurrentRole] = useState<WorkspaceRole | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch workspaces when user changes
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      setCurrentRole(null);
      setLoading(false);
    }
  }, [user]);

  // Fetch members and activities when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchMembers();
      fetchActivities();
      fetchCurrentRole();
      
      // Set up realtime subscription for activities
      const channel = supabase
        .channel(`activities-${currentWorkspace.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'team_activities',
            filter: `workspace_id=eq.${currentWorkspace.id}`,
          },
          (payload) => {
            const newActivity = payload.new as TeamActivity;
            setActivities((prev) => [newActivity, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentWorkspace?.id]);

  const fetchWorkspaces = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setWorkspaces(data || []);
      
      // Set first workspace as current if none selected
      if (data && data.length > 0 && !currentWorkspace) {
        const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        const savedWorkspace = data.find(w => w.id === savedWorkspaceId);
        setCurrentWorkspaceState(savedWorkspace || data[0]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentRole = async () => {
    if (!user || !currentWorkspace) return;

    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', currentWorkspace.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setCurrentRole(data?.role as WorkspaceRole || null);
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  const fetchMembers = async () => {
    if (!currentWorkspace) return;

    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;

      // Fetch profiles for all members
      const userIds = membersData?.map(m => m.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      // Combine members with profiles
      const membersWithProfiles: WorkspaceMember[] = (membersData || []).map(member => {
        const profile = profilesData?.find(p => p.user_id === member.user_id);
        return {
          ...member,
          profile: profile ? {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
          } : undefined,
        };
      });

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchActivities = async () => {
    if (!currentWorkspace) return;

    try {
      const { data, error } = await supabase
        .from('team_activities')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Map to TeamActivity type
      const activities: TeamActivity[] = (data || []).map(item => ({
        ...item,
        details: item.details as unknown,
      }));
      
      setActivities(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
  };

  const createWorkspace = async (name: string, description?: string): Promise<Workspace | null> => {
    if (!user) return null;

    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug,
          description: description || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      await fetchWorkspaces();
      toast.success('Workspace created successfully!');
      return workspace;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to create workspace: ' + errorMessage);
      return null;
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await fetchWorkspaces();
      toast.success('Workspace updated!');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to update workspace: ' + errorMessage);
      return false;
    }
  };

  const deleteWorkspace = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchWorkspaces();
      if (currentWorkspace?.id === id) {
        setCurrentWorkspaceState(workspaces[0] || null);
      }
      toast.success('Workspace deleted!');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to delete workspace: ' + errorMessage);
      return false;
    }
  };

  const inviteMember = async (workspaceId: string, userId: string, role: WorkspaceRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role,
        });

      if (error) throw error;

      await fetchMembers();
      toast.success('Member invited!');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to invite member: ' + errorMessage);
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, role: WorkspaceRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers();
      toast.success('Member role updated!');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to update role: ' + errorMessage);
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers();
      toast.success('Member removed!');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to remove member: ' + errorMessage);
      return false;
    }
  };

  const joinByInviteCode = async (code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('join_workspace_by_invite', { _invite_code: code });

      if (error) throw error;

      await fetchWorkspaces();
      
      // Switch to the joined workspace
      const joinedWorkspace = workspaces.find(w => w.id === data);
      if (joinedWorkspace) {
        setCurrentWorkspace(joinedWorkspace);
      }
      
      toast.success('Joined workspace successfully!');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to join workspace: ' + errorMessage);
      return false;
    }
  };

  const regenerateInviteCode = async (workspaceId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .rpc('regenerate_workspace_invite', { _workspace_id: workspaceId });

      if (error) throw error;

      await fetchWorkspaces();
      toast.success('Invite code regenerated!');
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to regenerate invite code: ' + errorMessage);
      return null;
    }
  };

  const logActivity = async (action: string, details?: Record<string, unknown>) => {
    if (!user || !currentWorkspace) return;

    try {
      await supabase
        .from('team_activities')
        .insert([{
          workspace_id: currentWorkspace.id,
          user_id: user.id,
          action,
          details: details ? JSON.stringify(details) : null,
        }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const refreshWorkspaces = async () => {
    await fetchWorkspaces();
  };

  const canEdit = currentRole === 'owner' || currentRole === 'editor';
  const isOwner = currentRole === 'owner';

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        currentRole,
        members,
        activities,
        loading,
        setCurrentWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        inviteMember,
        updateMemberRole,
        removeMember,
        joinByInviteCode,
        regenerateInviteCode,
        logActivity,
        canEdit,
        isOwner,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
