import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Copy, 
  Check, 
  RefreshCw, 
  Settings, 
  Trash2,
  Loader2 
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/common/GlassCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function WorkspaceSettings() {
  const { currentWorkspace, isOwner, updateWorkspace, deleteWorkspace, regenerateInviteCode } = useWorkspace();
  const [name, setName] = useState(currentWorkspace?.name || "");
  const [description, setDescription] = useState(currentWorkspace?.description || "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  if (!currentWorkspace) {
    return null;
  }

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await updateWorkspace(currentWorkspace.id, {
      name: name.trim(),
      description: description.trim() || null,
    });
    setSaving(false);
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(currentWorkspace.invite_code);
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/join/${currentWorkspace.invite_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied!');
  };

  const handleRegenerateCode = async () => {
    setRegenerating(true);
    await regenerateInviteCode(currentWorkspace.id);
    setRegenerating(false);
  };

  const handleDelete = async () => {
    await deleteWorkspace(currentWorkspace.id);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Workspace Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
              maxLength={50}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workspace-description">Description</Label>
            <Textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isOwner}
              maxLength={200}
              rows={3}
            />
          </div>

          {isOwner && (
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4">Invite Link</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share this code with others to invite them to your workspace. They'll join as viewers by default.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
            {currentWorkspace.invite_code}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyInviteCode}
          >
            {copied ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check className="w-4 h-4 text-primary" />
              </motion.div>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          {isOwner && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleRegenerateCode}
              disabled={regenerating}
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        <Button variant="secondary" onClick={handleCopyInviteLink} className="w-full">
          <Copy className="w-4 h-4 mr-2" />
          Copy Invite Link
        </Button>
      </GlassCard>

      {isOwner && (
        <GlassCard className="p-6 border-destructive/20">
          <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting a workspace is permanent and cannot be undone. All members will lose access.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  workspace "{currentWorkspace.name}" and remove all members.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </GlassCard>
      )}
    </div>
  );
}
