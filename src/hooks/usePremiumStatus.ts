import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePremiumStatus = (userId: string | undefined) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPremiumStatus = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", userId)
        .single();

      if (data) {
        setIsPremium(data.is_premium || false);
      }
      setLoading(false);
    };

    fetchPremiumStatus();

    // Subscribe to changes
    const channel = supabase
      .channel("premium-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setIsPremium((payload.new as any).is_premium || false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { isPremium, loading };
};
