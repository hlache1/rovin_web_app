"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ContactMonthStat = {
  status: string;
  month: string;
  count: number;
};

export function useContactsByMonth() {
  const [data, setData] = useState<ContactMonthStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_contacts_by_month");

      if (error) {
        setData([]);
      } else {
        setData(data || []);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  return { data, loading };
}
