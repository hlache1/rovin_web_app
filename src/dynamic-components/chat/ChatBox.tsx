"use client";
import React, { useRef, useEffect } from "react";
import ChatBoxHeader from "./ChatBoxHeader";
import ChatBoxSendForm from "./ChatBoxSendForm";
import Image from "next/image";

interface Message {
  id: string;
  body: string;
  sender: "contact" | "agent" | "system";
  type?: string;
  timestamp?: string;
  imagePreview?: string;
}

interface ChatBoxProps {
  contact?: {
    id: string;
    name: string;
    profileImage?: string;
    status?: string
  };
  messages: Message[];
  conversation_id: string | null;
  conversation_status: string | null;
  loading: boolean;
}

export default function ChatBox({ contact, messages, conversation_id, conversation_status, loading }: ChatBoxProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:w-3/4">
      <ChatBoxHeader 
        contact={contact}
        conversation_id={conversation_id}
        conversation_status={conversation_status} 
        />

      <div className="flex-1 max-h-dvh p-5 space-y-6 overflow-y-auto custom-scrollbar xl:space-y-8 xl:p-6">
        {loading ? (
          <p>Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400">No hay mensajes aún</p>
        ) : (
          messages.map((m) => {
            const isFromContact = m.sender === "contact";

            return (
              <div
                key={m.id}
                className={`flex ${isFromContact ? "items-start gap-4" : "justify-end"}`}
              >

                <div className={`${isFromContact ? "" : "text-right"}`}>
                  {m.imagePreview && (
                    <div className="mb-2 w-full max-w-[270px] overflow-hidden rounded-lg">
                      <Image
                        width={270}
                        height={150}
                        src={m.imagePreview}
                        alt="chat"
                        className="object-cover w-full"
                      />
                    </div>
                  )}

                  <div
                    className={`px-3 py-2 rounded-lg ${
                      isFromContact
                        ? "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white/90"
                        : "bg-blue-500 text-white dark:bg-blue-500"
                    } ${isFromContact ? "rounded-tl-sm" : "rounded-tr-sm"}`}
                  >
                    <p className="text-sm">{m.body}</p>
                  </div>

                  <p className="mt-2 text-gray-500 text-theme-xs dark:text-gray-400">
                    {isFromContact ? contact?.name : "Tú"}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatBoxSendForm conversationId={conversation_id}/>
    </div>
  );
}
