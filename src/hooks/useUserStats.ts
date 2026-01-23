import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserStats {
  posts_generated: number;
  reach_increase: number;
  engagement_rate: number;
  time_saved_hours: number;
}

const defaultStats: UserStats = {
  posts_generated: 0,
  reach_increase: 0,
  engagement_rate: 0,
  time_saved_hours: 0,
};

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setStats(defaultStats);
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching stats:", fetchError);
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      if (data) {
        setStats({
          posts_generated: data.posts_generated,
          reach_increase: Number(data.reach_increase),
          engagement_rate: Number(data.engagement_rate),
          time_saved_hours: data.time_saved_hours,
        });
      } else {
        // Create initial stats for user if they don't exist
        const { error: insertError } = await supabase
          .from("user_stats")
          .insert({ user_id: user.id });
        
        if (insertError) {
          console.error("Error creating stats:", insertError);
        }
      }

      setIsLoading(false);
    };

    fetchStats();

    // Set up realtime subscription
    const channel = supabase
      .channel(`user_stats_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_stats",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Stats updated:", payload);
          if (payload.new && typeof payload.new === "object") {
            const newData = payload.new as Record<string, unknown>;
            setStats({
              posts_generated: Number(newData.posts_generated) || 0,
              reach_increase: Number(newData.reach_increase) || 0,
              engagement_rate: Number(newData.engagement_rate) || 0,
              time_saved_hours: Number(newData.time_saved_hours) || 0,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const incrementPostsGenerated = async () => {
    if (!user) return;

    const { error: updateError } = await supabase
      .from("user_stats")
      .update({ posts_generated: stats.posts_generated + 1 })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating posts:", updateError);
    }
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    if (!user) return;

    const { error: updateError } = await supabase
      .from("user_stats")
      .update(updates)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating stats:", updateError);
    }
  };

  return {
    stats,
    isLoading,
    error,
    incrementPostsGenerated,
    updateStats,
  };
}
