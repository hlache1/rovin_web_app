"use client";

import { useState } from "react";

export function useSendBulkMessages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendBulk = async (numbers: string[], content: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/send-multiple-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: numbers, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error enviando mensajes");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendBulk, loading, error };
}
