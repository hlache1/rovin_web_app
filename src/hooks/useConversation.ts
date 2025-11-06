import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useConversation(userId: string | null, phone: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !phone) return;

    let channel: any;

    async function fetchMessages() {
      setLoading(true);
      try {
        // Obtener contacto
        const { data: contact, error: contactErr } = await supabase
          .from("contacts")
          .select("id")
          .eq("phone_number", phone)
          .single();

        if (contactErr || !contact) {
          setMessages([]);
          return;
        }

        // Obtener conversación
        const { data: conversation, error: convErr } = await supabase
          .from("conversations")
          .select("id, status")
          .eq("user_id", userId)
          .eq("contact_id", contact.id)
          .single();

        if (convErr || !conversation) {
          setMessages([]);
          setConversationId(null);
          setConversationStatus(null);
          return;
        }

        setConversationId(conversation.id);
        setConversationStatus(conversation.status);

        // Obtener mensajes iniciales
        const { data: messagesData, error: msgErr } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: true });

        if (msgErr) {
          setMessages([]);
          return;
        }

        const formatted = messagesData.map((m: any) => ({
          id: m.id,
          body: m.content,
          sender: m.sender,
          type: m.type,
          timestamp: m.created_at,
        }));

        setMessages(formatted);

        // Suscripción en tiempo real con Supabase v2
        channel = supabase
          .channel(`conversation-${conversation.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `conversation_id=eq.${conversation.id}`,
            },
            (payload) => {
              setMessages((prev) => [
                ...prev,
                {
                  id: payload.new.id,
                  body: payload.new.content,
                  sender: payload.new.sender,
                  type: payload.new.type,
                  timestamp: payload.new.created_at,
                },
              ]);
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "conversations",
              filter: `id=eq.${conversation.id}`,
            },
            (payload) => {
              setConversationId(payload.new.id);
              setConversationStatus(payload.new.status); 
            }
          )
          .subscribe();
      } catch (err) {
        setMessages([]);
        setConversationId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId, phone]);

  return { messages, loading, conversationId, conversationStatus };
}
