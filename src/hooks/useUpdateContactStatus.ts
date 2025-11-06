"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useUpdateContactStatus() {
  const [loading, setLoading] = useState(false);

  async function updateStatus(contactId: string, status: string) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("contacts")
        .update({ status })
        .eq("id", contactId);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setLoading(false);
    }
  }
  return { updateStatus, loading };
}