"use client";

import {  useEffect, useState } from "react";
import { PaperPlaneIcon } from "@/icons";
import { supabase } from "@/lib/supabase/client";
import Button from "@/components/ui/button/Button";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user" as const,
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          message: input,
        }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      const botReply = data?.response?.response || "No se recibió respuesta.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: botReply },
      ]);
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "⚠️ Error al procesar tu mensaje.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] p-3">
      {/* lista de mensajes */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`w-fit max-w-[80%] px-3 py-2 rounded-xl text-sm ${
              msg.role === "user"
                ? "bg-blue-600 text-white self-end ml-auto"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-400 italic mt-2">Escribiendo...</div>
        )}
      </div>

      {/* input + botón */}
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <Button size="sm" onClick={sendMessage} disabled={loading}>
          <PaperPlaneIcon />
        </Button>
      </div>
    </div>
  );
}
