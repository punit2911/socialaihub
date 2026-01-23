import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Camera,
  Building2,
  Briefcase,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/common/GlassCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSettings() {
  const { user } = useAuth();
  const { profile, isLoading, isSaving, updateProfile, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    company: "",
    job_title: "",
    website: "",
    twitter_handle: "",
    instagram_handle: "",
    linkedin_url: "",
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        company: profile.company || "",
        job_title: profile.job_title || "",
        website: profile.website || "",
        twitter_handle: profile.twitter_handle || "",
        instagram_handle: profile.instagram_handle || "",
        linkedin_url: profile.linkedin_url || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      await uploadAvatar(file);
    }
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setHasChanges(false);
  };

  const getInitials = () => {
    if (formData.display_name) {
      return formData.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Profile Settings"
        description="Manage your account details and public profile"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Profile Picture</h3>
            
            <div className="flex flex-col items-center">
              <motion.div
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <Skeleton className="w-32 h-32 rounded-full" />
                ) : (
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || ""} alt="Profile" />
                    <AvatarFallback className="text-2xl font-display bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <motion.div
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                >
                  <Camera className="w-8 h-8 text-white" />
                </motion.div>
                
                {/* Animated ring */}
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Click to upload a new avatar
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </div>

            {/* Account Info */}
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Account</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate ml-2">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold">Profile Details</h3>
              <AnimatePresence>
                {hasChanges && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-xs text-accent"
                  >
                    Unsaved changes
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Display Name
                    </Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange("display_name", e.target.value)}
                      placeholder="Your name"
                      className="bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job_title" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      Job Title
                    </Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => handleInputChange("job_title", e.target.value)}
                      placeholder="e.g. Marketing Manager"
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    placeholder="Your company or organization"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>

                {/* Links & Social */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-4">Links & Social</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="flex items-center gap-2">
                          <Twitter className="w-4 h-4 text-muted-foreground" />
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={formData.twitter_handle}
                          onChange={(e) => handleInputChange("twitter_handle", e.target.value)}
                          placeholder="@username"
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-muted-foreground" />
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={formData.instagram_handle}
                          onChange={(e) => handleInputChange("instagram_handle", e.target.value)}
                          placeholder="@username"
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-muted-foreground" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin_url}
                          onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                          placeholder="Profile URL"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
