"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  name?: string | null;
};

type OrderDetail = {
  id: string;
  order_id: string;
  product_id?: string | null;
  quantity: number;
  unit_price: string | number;
  created_at?: string;
  product?: Product | null; 
};

type Order = {
  id: string;
  organization_id?: string | null;
  customer_id?: string | null;
  status: string;
  total: string | number;
  created_at: string;
  updated_at?: string;
  order_details?: OrderDetail[];
};

/**
 * useOrderDetails - fetch a single order with its order_details and product info
 * 
 * @param id order id (uuid)
 * @returns { order, loading, error }
 */
export function useOrderDetails(id?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchOrder() {
      if (!id) {
        setOrder(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      const select = `id, organization_id, customer_id, status, total, created_at, order_details(id, order_id, product_id, quantity, unit_price, product:products(id, name))`

      const { data, error } = await supabase
        .from("orders")
        .select(select, { count: "exact" })
        .eq("id", id)
        .single();

      if (!mounted) return;

      if (error) {
        setError(error);
        setOrder(null);
      } else if (data) {
        if (data.order_details && Array.isArray(data.order_details)) {
          data.order_details = data.order_details.map((d: any) => ({
            ...d,
            unit_price: typeof d.unit_price === "string" ? parseFloat(d.unit_price) : d.unit_price,
            quantity: typeof d.quantity === "string" ? parseInt(d.quantity, 10) : d.quantity,
          }));
        }
        // also normalize order.total
        const total = typeof data.total === "string" ? parseFloat(data.total) : data.total;
        data.total = total;

        setOrder(data as Order);
      } else {
        setOrder(null);
      }
      setLoading(false);
    }

    fetchOrder();
    return () => {
      mounted = false;
    };
  }, [id]);

  return { order, loading, error } as const;
}