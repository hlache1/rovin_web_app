"use client"
import React, { useState } from "react";
import { useConversation } from "@/hooks/useConversation";
import { useUser } from "@/hooks/useUser";
import { useContacts } from "@/hooks/useContacts";
import ChatBox from "@/dynamic-components/chat/ChatBox";
import Pagination from "@/dynamic-components/tables/DataTables/TableOne/Pagination";

export default function ChatPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(5);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [selectedContact, setSelectedContact] = useState<any | null>(null);

    const { user, loading: loadingUser } = useUser();
    const { contacts, loading: loadingContacts } = useContacts(
      user?.id ?? null,
      currentPage,
      rowsPerPage,
      null, 
      statusFilter
    );

    const { messages, loading: loadingMessages, conversationId, conversationStatus } = useConversation(
      user?.id ?? null,
      selectedContact?.phone_number ?? null
    );    
    
    const filters = [
      { label: "Todos", emoji: "📋" },
      { label: "Lead generado", emoji: "🆕" },
      { label: "Lead activo", emoji: "🔥" },
      { label: "Lead ganado", emoji: "👤" },
      { label: "Lead inactivo", emoji: "❄️" },
    ];

    if (loadingUser) return <div>Loading...</div>;

    return (
      <div className="flex flex-col md:grid md:grid-cols-12 h-screen">
          {/* Columna izquierda */}
          <aside className="md:col-span-2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 p-2 md:p-4 flex md:block justify-around">
            {filters.map((f) => (
              <button
                key={f.label}
                onClick={() => setStatusFilter(f.label === "Todos" ? null : f.label)}
                className={`flex flex-col items-center md:items-start w-full md:w-auto px-2 py-1 rounded-md text-sm md:text-base ${
                  statusFilter === f.label || (f.label === "Todos" && !statusFilter)
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 text-gray-600"
                }`}
              >
                {/* En móvil: emoji, en desktop: texto */}
                <span className="md:hidden text-lg">{f.emoji}</span>
                <span className="hidden md:inline">{f.label}</span>
              </button>
            ))}
          </aside>
    
          {/* Columna central */}
          <main className="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 dark:text-gray-200 p-4 flex flex-col h-full">
            <h2 className="font-semibold mb-4 hidden md:block">Contactos</h2>

            {loadingContacts ? (
                <p>Cargando contactos...</p>
            ) : contacts.length === 0 ? (
                <p>No hay contactos</p>
            ) : (
                <>
                {/* Lista de contactos con scroll */}
                <ul className="space-y-2 flex-1 overflow-y-auto">
                    {contacts.map((c) => (
                    <li
                        key={c.id}
                        onClick={() => setSelectedContact(c)}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                        <div className="font-medium">{c.name}</div>
                        <div className="text-sm text-gray-500 truncate">{c.phone_number}</div>
                        <div className="text-xs text-gray-400">{c.status}</div>
                    </li>
                    ))}
                </ul>

                {/* Paginación siempre abajo */}
                <div className="mt-2">
                    <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil((contacts?.length || 0) / rowsPerPage)}
                    onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
                </>
            )}
            </main>
    
        <section className="md:col-span-6 p-4 flex-1">
            {selectedContact ? (
                <ChatBox
                contact={selectedContact}
                messages={messages}
                conversation_id={conversationId}
                conversation_status={conversationStatus}
                loading={loadingMessages}
                />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Selecciona un contacto para abrir el chat
                    </div>
                )}
        </section>
      </div>
    );
        
}