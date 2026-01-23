import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Users } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";

export default function JoinWorkspace() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { joinByInviteCode, loading } = useWorkspace();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleJoin = async () => {
      if (authLoading) return;
      
      if (!user) {
        // Store invite code and redirect to login
        localStorage.setItem('pendingInviteCode', inviteCode || '');
        navigate('/login');
        return;
      }

      if (inviteCode) {
        const success = await joinByInviteCode(inviteCode);
        if (success) {
          navigate('/');
        } else {
          navigate('/');
        }
      }
    };

    handleJoin();
  }, [inviteCode, user, authLoading, joinByInviteCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <Users className="w-8 h-8 text-primary" />
          )}
        </div>
        <h1 className="text-xl font-semibold mb-2">Joining Workspace...</h1>
        <p className="text-muted-foreground text-sm">
          Please wait while we add you to the workspace.
        </p>
      </motion.div>
    </div>
  );
}
