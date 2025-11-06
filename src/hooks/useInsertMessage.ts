"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useInsertMessage() {
  const [loading, setLoading] = useState(false);

  async function insertMessage(conversationId: string | null, content: string) {
    setLoading(true);

    try {
      if(!conversationId) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "+529612140339",
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Error enviando mensaje a MessageBird");
      }

      const { error } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            content,
            sender: "system",
            type: "text",
          },
        ]);

      if (error) throw error;
    } catch (err) {
      console.error("Error inserting message:", err);
    } finally {
      setLoading(false);
    }
  }

  return { insertMessage, loading };
}
