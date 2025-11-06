"use client";
import React, { useState, useEffect } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import { useUpdateContactStatus } from "@/hooks/useUpdateContactStatus";
import { supabase } from "@/lib/supabase/client";

interface ChatBoxHeaderProps {
  contact?: {
    id: string;
    name: string;
    profileImage?: string;
    status?: string;
  };
  conversation_id: string | null;
  conversation_status: string | null;
}

export default function ChatBoxHeader({ contact, conversation_id, conversation_status }: ChatBoxHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(contact?.status || "");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const { updateStatus, loading } = useUpdateContactStatus();

  const status_filters = [
    { label: "Lead generado", emoji: "🆕" },
    { label: "Lead activo", emoji: "🔥" },
    { label: "Lead ganado", emoji: "👤" },
    { label: "Lead inactivo", emoji: "❄️" },
  ];

  useEffect(() => {
    setLocalStatus(contact?.status || "");
  }, [contact?.status]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleSelect(status: string) {
    setLocalStatus(status);
    closeDropdown();   

    if (!contact?.id) return;
    await updateStatus(contact.id, status);
  }

  
  async function toggleConversationStatus() {
    if (!conversation_id || !conversation_status) return;

    if (conversation_status === "escalated" && !confirming) {
      setConfirming(true);
      return;
    }
  
    setSaving(true);

    const newStatus = conversation_status === "escalated" ? "open" : "escalated";

    await supabase
      .from("conversations")
      .update({ status: newStatus })
      .eq("id", conversation_id);

    setSaving(false);
    setConfirming(false);
  }

  return (
    <div className="sticky flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 xl:px-6">
      <div className="flex items-center gap-3">
  
        <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {contact?.name || "Sin contacto"}
        </h5>
      </div>

      {conversation_status === "escalated" && (
        <button
          onClick={toggleConversationStatus}
          disabled={saving}
          className={`text-xs px-3 py-1 rounded-full transition bg-gray-100 
            ${saving && "opacity-50 cursor-not-allowed"}
          `}
        >
          {saving
            ? "Actualizando..."
            : conversation_status === "escalated"
              ? (confirming ? "✅ Finalizar revisión" : "⚠️ En revisión")
              : "⬆️ Escalar"
          }
        </button>
      )}

      <div className="flex items-center gap-3">
        {/* Status actual */}
        {contact?.status && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/5 dark:text-gray-50">
            {status_filters.find(f => f.label === contact.status)?.emoji} {localStatus}
          </span>
        )}

        <div className="relative -mb-1.5">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>

          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-44 p-2">
            {status_filters.map((f) => (
              <DropdownItem
                key={f.label}
                onItemClick={() => handleSelect(f.label)}
                className={`flex items-center gap-2 ${
                  f.label === localStatus ? "font-semibold text-blue-600" : ""
                }`}
              >
                <span>{f.emoji}</span>
                {f.label}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
