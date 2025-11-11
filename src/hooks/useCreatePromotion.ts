"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useCreatePromotion() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function createPromotion({
    name,
    description,
    promoType,
    rewardValue,
    conditions,
    endDate,
  }: {
    name: string;
    description: string;
    promoType: string;
    rewardValue: number;
    conditions: Array<{
      condition_type: string;
      condition_value: string;
    }>;
    endDate: string | null;
  }) {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: promo, error: promoError } = await supabase
        .from("promotions")
        .insert({
          name,
          description,
          discount_type: promoType,
          discount_value: rewardValue,
          active: true,
          start_date: new Date().toISOString(), 
          end_date: endDate ? new Date(endDate) : null,
        })
        .select()
        .single();

      if (promoError) {
        throw promoError;
      }

      if (conditions.length > 0) {
        const { error: condError } = await supabase
          .from("promotion_conditions")
          .insert(
            conditions.map((c) => ({
              promotion_id: promo.id,
              condition_type: c.condition_type,
              condition_value: c.condition_value,
            }))
          );
        if (condError) throw condError;
      }

      const { error: rewardError } = await supabase
        .from("promotion_rewards")
        .insert({
          promotion_id: promo.id,
          reward_type: promoType === "bundle" ? "bundle_price" : "discount",
          reward_value: rewardValue,
        });

      if (rewardError){
        throw rewardError;
      }

      return { success: true, promotion: promo };

    } catch (err: any) {
      setErrorMsg(err.message || "Error creating promotion");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }

  return { createPromotion, loading, errorMsg };
}
