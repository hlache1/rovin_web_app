"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * usePromotions: Retrieves a paginated list of promotions from Supabase.
 *
 * @param page number (1-based)
 * @param rowsPerPage number
 */
export function usePromotions(page: number, rowsPerPage: number) {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPromotions() {
      setLoading(true);
      const start = Math.max(0, (page - 1) * rowsPerPage);
      const end = start + rowsPerPage - 1;

      const { data, error, count } = await supabase
        .from('promotions')
        .select(`
            *,
            promotion_conditions (*),
            promotion_rewards (*)
        `, { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Error fetching promotions:", error);
        setPromotions([]);
        setTotal(0);
      } else {
        setPromotions(data || []);
        setTotal(count ?? (data?.length ?? 0));
      }
        
      setLoading(false);
    }

    fetchPromotions();

    return () => {
      mounted = false;
    };
  }, [page, rowsPerPage]);

  return { promotions, total, loading };
}