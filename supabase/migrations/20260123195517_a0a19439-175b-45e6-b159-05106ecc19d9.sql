-- Create workspace role enum
CREATE TYPE public.workspace_role AS ENUM ('owner', 'editor', 'viewer');

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  avatar_url TEXT,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_members join table
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role workspace_role NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create team_activities table for activity feed
CREATE TABLE public.team_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- Security definer function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
  )
$$;

-- Security definer function to check workspace role
CREATE OR REPLACE FUNCTION public.has_workspace_role(_user_id UUID, _workspace_id UUID, _role workspace_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role = _role
  )
$$;

-- Security definer function to check if user can edit (owner or editor)
CREATE OR REPLACE FUNCTION public.can_edit_workspace(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role IN ('owner', 'editor')
  )
$$;

-- Security definer function to check if user is workspace owner
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role = 'owner'
  )
$$;

-- Get user's workspace role
CREATE OR REPLACE FUNCTION public.get_workspace_role(_user_id UUID, _workspace_id UUID)
RETURNS workspace_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.workspace_members
  WHERE user_id = _user_id
    AND workspace_id = _workspace_id
$$;

-- RLS Policies for workspaces
CREATE POLICY "Members can view their workspaces"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their workspaces"
  ON public.workspaces FOR UPDATE
  USING (public.is_workspace_owner(auth.uid(), id));

CREATE POLICY "Owners can delete their workspaces"
  ON public.workspaces FOR DELETE
  USING (public.is_workspace_owner(auth.uid(), id));

-- RLS Policies for workspace_members
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Owners can manage workspace members"
  ON public.workspace_members FOR INSERT
  WITH CHECK (
    public.is_workspace_owner(auth.uid(), workspace_id) 
    OR (auth.uid() = user_id AND role != 'owner')
  );

CREATE POLICY "Owners can update workspace members"
  ON public.workspace_members FOR UPDATE
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "Owners can delete workspace members"
  ON public.workspace_members FOR DELETE
  USING (public.is_workspace_owner(auth.uid(), workspace_id) OR auth.uid() = user_id);

-- RLS Policies for team_activities
CREATE POLICY "Members can view workspace activities"
  ON public.team_activities FOR SELECT
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can insert activities"
  ON public.team_activities FOR INSERT
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id) AND auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create personal workspace on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  workspace_id UUID;
  user_name TEXT;
BEGIN
  -- Get user's display name
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'Personal');
  
  -- Create personal workspace
  INSERT INTO public.workspaces (name, slug, description, owner_id)
  VALUES (
    user_name || '''s Workspace',
    'personal-' || replace(NEW.id::text, '-', ''),
    'Personal workspace',
    NEW.id
  )
  RETURNING id INTO workspace_id;
  
  -- Add user as owner of the workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (workspace_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating workspace on signup
CREATE TRIGGER on_auth_user_created_workspace
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_workspace();

-- Function to join workspace via invite code
CREATE OR REPLACE FUNCTION public.join_workspace_by_invite(_invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _workspace_id UUID;
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Find workspace by invite code
  SELECT id INTO _workspace_id
  FROM public.workspaces
  WHERE invite_code = _invite_code;
  
  IF _workspace_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if already a member
  IF public.is_workspace_member(_user_id, _workspace_id) THEN
    RETURN _workspace_id;
  END IF;
  
  -- Add user as viewer by default
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (_workspace_id, _user_id, 'viewer');
  
  -- Log activity
  INSERT INTO public.team_activities (workspace_id, user_id, action, details)
  VALUES (_workspace_id, _user_id, 'joined_workspace', '{"method": "invite_code"}'::jsonb);
  
  RETURN _workspace_id;
END;
$$;

-- Function to regenerate invite code
CREATE OR REPLACE FUNCTION public.regenerate_workspace_invite(_workspace_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  IF NOT public.is_workspace_owner(auth.uid(), _workspace_id) THEN
    RAISE EXCEPTION 'Only owners can regenerate invite codes';
  END IF;
  
  new_code := encode(gen_random_bytes(8), 'hex');
  
  UPDATE public.workspaces
  SET invite_code = new_code
  WHERE id = _workspace_id;
  
  RETURN new_code;
END;
$$;

-- Enable realtime for activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_activities;