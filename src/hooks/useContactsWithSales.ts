"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * useContactsWithSales: Retrieves a paginated list of contacts and its sales data from Supabase with optional search and status filtering.
 *
 * @param user_id string
 * @param page number (1-based)
 * @param rowsPerPage number
 * @param search optional string
 * @param statusFilter optional status to filter
 */
export function useContactsWithSales(
  user_id: string | null,
  page: number,
  rowsPerPage: number,
  search?: string | null,
  statusFilter?: string | null
) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchContacts() {
      if (!user_id || user_id.trim().length === 0) {
        if (mounted) {
          setContacts([]);
          setTotal(0);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const offset = Math.max(0, (page - 1) * rowsPerPage);
      const limit = rowsPerPage;

      const { data, error } = await supabase.rpc("get_contacts_summary", {
        _user_id: user_id,
        _search: search && search.trim().length > 0 ? search.trim() : null,
        _status: statusFilter && statusFilter.trim().length > 0 ? statusFilter.trim() : null,
        _offset: offset,
        _limit: limit,
      });

      if (!mounted) return;

      if (error) {
        setContacts([]);
        setTotal(0);
      } else {
        setContacts(data ?? []);
        setTotal(data?.[0]?.total_count ?? 0);
      }

      setLoading(false);
    }

    fetchContacts();

    return () => {
      mounted = false;
    };
  }, [user_id, page, rowsPerPage, search, statusFilter]);

  return { contacts, total, loading };
}