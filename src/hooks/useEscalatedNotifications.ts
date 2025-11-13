"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface EscalatedConversation {
  id: string;
  contact_id: string;
  user_id: string | null;
  last_message_at: string | null;
  created_at: string;
  status: string;
}

interface ContactInfo {
  id: string;
  name: string;
  phone_number: string;
}
  
interface EscalatedNotification extends EscalatedConversation {
  contact?: ContactInfo | null;
}

export function useEscalatedNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<EscalatedNotification[]>([]);
    const [hasNew, setHasNew] = useState(false);

    useEffect(() => {
        const channel = supabase
          .channel("conversations-updates")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "conversations",
              filter: userId ? `user_id=eq.${userId}` : undefined,
            },
            async (payload) => {
              const newRow = payload.new as EscalatedConversation;
              const oldRow = payload.old as EscalatedConversation;
    
              if (newRow.status === "escalated" && oldRow.status !== "escalated") {
                const { data: contact, error } = await supabase
                .from("contacts")
                .select("id, name, phone_number")
                .eq("id", newRow.contact_id)
                .maybeSingle();

                if (error) console.error("Error fetching contact:", error);

                setNotifications((prev) => [
                { ...newRow, contact },
                ...prev,
                ]);
                setHasNew(true);
              }
            }
          )
          .subscribe();
    
        return () => {
          supabase.removeChannel(channel);
        };
    }, [userId]);
    
    return { notifications, hasNew, setHasNew };
}
