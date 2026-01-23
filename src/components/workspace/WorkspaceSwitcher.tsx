import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { JoinWorkspaceDialog } from "./JoinWorkspaceDialog";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
  const { workspaces, currentWorkspace, setCurrentWorkspace, currentRole } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-primary/20 text-primary';
      case 'editor':
        return 'bg-accent/20 text-accent';
      case 'viewer':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-lg"
          >
            <Users className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start" side="right">
          <Command>
            <CommandInput placeholder="Search workspaces..." />
            <CommandList>
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup heading="Workspaces">
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() => {
                      setCurrentWorkspace(workspace);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="truncate">{workspace.name}</span>
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={() => { setCreateOpen(true); setOpen(false); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </CommandItem>
                <CommandItem onSelect={() => { setJoinOpen(true); setOpen(false); }}>
                  <Users className="w-4 h-4 mr-2" />
                  Join Workspace
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
        <JoinWorkspaceDialog open={joinOpen} onOpenChange={setJoinOpen} />
      </Popover>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 py-2 h-auto"
          >
            <div className="flex items-center gap-3 min-w-0">
              <motion.div 
                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm font-semibold text-primary">
                  {currentWorkspace?.name.charAt(0).toUpperCase() || 'W'}
                </span>
              </motion.div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {currentWorkspace?.name || 'Select workspace'}
                </span>
                {currentRole && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded capitalize",
                    getRoleBadgeColor(currentRole)
                  )}>
                    {currentRole}
                  </span>
                )}
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search workspaces..." />
            <CommandList>
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup heading="Workspaces">
                <AnimatePresence>
                  {workspaces.map((workspace, index) => (
                    <motion.div
                      key={workspace.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommandItem
                        onSelect={() => {
                          setCurrentWorkspace(workspace);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {workspace.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="truncate">{workspace.name}</span>
                        </div>
                        {currentWorkspace?.id === workspace.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </CommandItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem 
                  onSelect={() => { setCreateOpen(true); setOpen(false); }}
                  className="cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </CommandItem>
                <CommandItem 
                  onSelect={() => { setJoinOpen(true); setOpen(false); }}
                  className="cursor-pointer"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Workspace
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinWorkspaceDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </>
  );
}
