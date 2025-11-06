"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase/client';

type LeadStats = {
  status: string;
  current_count: number;
  previous_count: number;
};

export function useLeadsStats() {
  const [stats, setStats] = useState<LeadStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      // Rango de fechas (últimos 2 meses)
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      // Consulta SQL
      const { data, error } = await supabase.rpc("lead_stats", {
        start_last_month: startOfLastMonth.toISOString(),
        start_this_month: startOfThisMonth.toISOString(),
      });

      if (error) {
        setStats([]);
      } else {
        setStats(data || []);
      }

      setLoading(false);
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
