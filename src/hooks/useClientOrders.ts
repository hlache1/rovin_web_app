"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  order_details: {
    id: string;
    quantity: number;
    unit_price: number;
    product: {
      id: string;
      name: string;
      description: string | null;
    } | null;
  }[];
  order_promotions: {
    id: string;
    discount_amount: number;
    promotion: {
      id: string;
      name: string;
      discount_type: string;
      discount_value: number;
    };
  }[];
}

export function useClientOrders(clientId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    async function fetchOrders() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          total,
          created_at,
          updated_at,
          order_details (
            id,
            quantity,
            unit_price,
            product:products (
              id,
              name,
              description
            )
          ),
          order_promotions (
            id,
            discount_amount,
            promotion:promotions (
              id,
              name,
              discount_type,
              discount_value
            )
          )
        `)
        .eq("customer_id", clientId)
        .order("created_at", { ascending: false });

    if (error) {
        setError(error.message);
    } else {
        const formattedData = data?.map((order: any) => ({
            ...order,
            order_details: order.order_details.map((detail: any) => ({
                ...detail,
                product: detail.product || null, 
            })),
            order_promotions: order.order_promotions.map((promotion: any) => ({
                ...promotion,
                promotion: promotion.promotion || null, 
            })),
        })) || [];
        setOrders(formattedData);
    }

    setLoading(false);
    }

    fetchOrders();
  }, [clientId]);

  return { orders, loading, error };
}
