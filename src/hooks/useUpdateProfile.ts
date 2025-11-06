"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";



export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function updateProfile(userId: string, updates: Record<string, any>) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase
      .from("users_mirror")
      .update(updates)
      .eq("id", userId);

    setLoading(false);

    if (error) {
      setError(error.message);
      return { success: false, error };
    } else {
      setSuccess(true);
      return { success: true };
    }
  }

  return { updateProfile, loading, error, success };
}
