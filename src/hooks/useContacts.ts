"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * useContacts: Retrieves a paginated list of contacts from Supabase with optional search and status filtering.
 *
 * @param user_id string
 * @param page number (1-based)
 * @param rowsPerPage number
 * @param search optional string
 * @param statusFilter optional status to filter
 */
export function useContacts(
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

      const start = Math.max(0, (page - 1) * rowsPerPage);
      const end = start + rowsPerPage - 1;

      let base = supabase
        .from("contacts")
        .select("id, name, email, phone_number, status, created_at", {
          count: "exact",
        })
        .order("created_at", { ascending: false });
        
      // filtro obligatorio por usuario
      base = base.eq("user_id", user_id);

      // filtros opcionales
      if (search && search.trim().length > 0) {
        base = base.ilike("name", `%${search}%`);
      }

      if (statusFilter && statusFilter.trim().length > 0) {
        base = base.eq("status", statusFilter);
      }

      // paginación
      const { data, count, error } = await base.range(start, end);

      if (!mounted) return;

      if (error) {
        setContacts([]);
        setTotal(0);
      } else {
        setContacts(data ?? []);
        setTotal(count ?? 0);
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