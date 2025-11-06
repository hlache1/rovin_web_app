// hooks/useInvoices.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * useInvoices: Retrieves a paginated list of invoices from Supabase with optional search and status filtering.
 *
 * @param page number (1-based)
 * @param rowsPerPage number
 * @param search string
 * @param statusFilter optional status to filter
 * @param organizationId optional org filter
 */
export function useInvoices(
  page: number,
  rowsPerPage: number,
  search: string,
  statusFilter?: string | null,
  organizationId?: string | null
) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchInvoices() {
      try {
        setLoading(true);
        setError(null);

        const start = Math.max(0, (page - 1) * rowsPerPage);
        const end = start + rowsPerPage - 1;

        let base = supabase
          .from("orders")
          .select(
            `id, total, created_at, updated_at, status, customer_id, contacts!inner(name)`,
            { count: "exact" }
          )
          .order("created_at", { ascending: false });

        // Organization filter
        if (organizationId) {
          base = base.eq("organization_id", organizationId);
        }

        // Search (applies to contact name or order id/number)
        if (search && search.trim().length > 0) {
          const term = `%${search.trim()}%`;
          base = base.ilike('contacts.name', term);
        }

        // Status filter
        if (statusFilter && (statusFilter !== "All" && statusFilter !== "Todos")) {
          base = base.eq("status", statusFilter.toLowerCase());
        }

        const query = base.range(start, end);

        const { data, error, count } = await query;

        if (error) throw error;

        if (mounted) {
          const normalized = (data ?? []).map((r: any) => ({
            ...r,
            customer_name: r.contacts?.name ?? null,
          }));

          // const mapped = mapOrdersToInvoices(normalized);
          setInvoices(normalized);
          setTotal(typeof count === "number" ? count : (data ?? []).length);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setInvoices([]);
          setTotal(0);
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchInvoices();

    return () => {
      mounted = false;
    };
  }, [page, rowsPerPage, search, statusFilter, organizationId]);

  return { invoices, total, loading, error };
}
