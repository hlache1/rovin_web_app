"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useAgents(id?: string | null) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchAgents() {
      setLoading(true);
        
      let query = supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (id && id.trim().length > 0) {
        query = query.eq('id', id.trim());
      }

      const { data, error } = await query;

      if (error) {
        if (mounted) {
          setAgents([]);
          setLoading(false);
        }
      } else if (mounted) {
        setAgents(data || []);
        setLoading(false);
      }
    }

    fetchAgents();

    return () => {
      mounted = false;
    };
    
  }, [])

  return { agents, loading };
}