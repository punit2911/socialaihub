import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  job_title: string | null;
  website: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } else {
        setProfile(data as Profile);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return false;

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      setIsSaving(false);
      return false;
    }

    setProfile({ ...profile, ...updates });
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
    setIsSaving(false);
    return true;
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    setIsSaving(true);

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      setIsSaving(false);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    await updateProfile({ avatar_url: publicUrl });
    setIsSaving(false);
    return publicUrl;
  };

  return {
    profile,
    isLoading,
    isSaving,
    updateProfile,
    uploadAvatar,
  };
}
