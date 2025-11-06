// hooks/useInvoiceMetrics.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type Metric = { label: string; value: string };

export function useInvoiceMetrics(
  organizationId: string | null = null,
  startDate?: string | null,
  endDate?: string | null
) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  async function fetchMetrics() {
    try {
      setLoading(true);
      setError(null);

      // Llamada RPC a la función que creamos en SQL
      const { data, error } = await supabase.rpc("get_order_metrics", {
        p_org_id: organizationId ?? null,
        p_start_date: startDate ?? null,
        p_end_date: endDate ?? null,
      });

      if (error) throw error;

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;

      const totalOrders = row?.total_orders ? Number(row.total_orders) : 0;
      const totalAmount = row?.total_amount ? Number(row.total_amount) : 0;
      const totalPaid = row?.total_paid ? Number(row.total_paid) : 0;

      const result: Metric[] = [
        { label: "Pedidos", value: String(totalOrders) },
        { label: "Total de pedidos", value: `$${totalAmount.toFixed(2)}` },
        { label: "Total pagado", value: `$${totalPaid.toFixed(2)}` },
      ];

      setMetrics(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setMetrics([]);
      setLoading(false);
      return [];
    }
  }

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, startDate, endDate]);

  return { metrics, loading, error, refresh: fetchMetrics };
}
