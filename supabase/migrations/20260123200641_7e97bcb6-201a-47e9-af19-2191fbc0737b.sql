-- Fix workspace_members INSERT policy so a workspace creator can add themselves as the initial owner
DROP POLICY IF EXISTS "Owners can manage workspace members" ON public.workspace_members;

CREATE POLICY "Owners can manage workspace members"
  ON public.workspace_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Existing owners can add members
    public.is_workspace_owner(auth.uid(), workspace_id)
    OR (
      -- Bootstrap: creator can insert their own owner membership for a workspace they own
      auth.uid() = user_id
      AND role = 'owner'
      AND EXISTS (
        SELECT 1
        FROM public.workspaces w
        WHERE w.id = workspace_id
          AND w.owner_id = auth.uid()
      )
    )
  );