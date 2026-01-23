-- Add SELECT policy for workspace owners (needed for INSERT RETURNING)
CREATE POLICY "Owners can view their workspaces"
  ON public.workspaces FOR SELECT
  USING (auth.uid() = owner_id);