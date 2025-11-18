"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useContactsWithSales } from "@/hooks/useContactsWithSales"; 
import { useSendBulkMessages } from "@/hooks/useSendBulkMessages";
import { useDebounce } from "@/hooks/useDebounce";
import { useUser } from "@/hooks/useUser";
import { useModal } from "@/hooks/useModal";
import { LEAD_STATUSES, LeadStatusKey } from "@/utils/statuses";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { PaperPlaneIcon } from "@/icons";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/dynamic-components/tables/DataTables/TableOne/DataTable";

export default function ClientsPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState("");
  const [messageInput, setmessageInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const statusOptions = LEAD_STATUSES.map(s => s.key);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { user, loading: loadingUser } = useUser();
  const { contacts, total, loading } = useContactsWithSales(user?.id ?? null, currentPage, rowsPerPage, debouncedSearch, statusFilter);
  const { sendBulk, loading: loadingMessages } = useSendBulkMessages();

  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

  useEffect(() => {
    const statusFromURL = searchParams.get("status") as LeadStatusKey; 
    if (statusFromURL && statusOptions.includes(statusFromURL)) {
      setStatusFilter(statusFromURL);
    }
  }, [searchParams]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [total, rowsPerPage, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);


  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (item: any) => (
        <Link href={`/clients/${item.id}`} className="text-gray-500 hover:underline" >
          <p className="font-medium">{item.name}</p>
        </Link>
      ),
    },
    { key: "phone_number", label: "Número telefonico" },
    {
      key: "email",
      label: "Email",
      render: (item: any) => (item.email ? <p>{item.email}</p> : <p>N/A</p>),
    },
    {
      key: "status",
      label: "Estatus",
      render: (item: any) => (
        <Badge
          size="sm"
          color={LEAD_STATUSES.find(s => s.key === item.status)?.badgeColor || "error"}
          variant="light"
        >
          {item.status}
        </Badge>
      ),
    },
    { 
      key: "total_spent", 
      label: "Total gastado",
      render: (item: any) => (
        <p>${item.total_spent ? item.total_spent.toFixed(2) : "0.00"}</p>
      ),
    },
    {
      key: "last_purchase", 
      label: "Última orden",
      render: (item: any) => (
        <p>{item.last_purchase ? new Date(item.last_purchase).toLocaleDateString() : "N/A"}</p>
      ),
    }
  ];

  if (loading || loadingUser || loadingMessages) return <p>Loading...</p>;

  const handleStatusChange = (newStatus: string | null) => {
    setStatusFilter(newStatus);

    const params = new URLSearchParams(searchParams.toString());

    if (newStatus) {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    router.push(`?${params.toString()}`);
  };

  const handleSendMessage = async () => {
    const numbers = selectedContacts.map(c => c.phone_number);
    
    if (numbers.length === 0) return;
    if (messageInput.trim() === "") return;
    
    await sendBulk(numbers, messageInput);
    setmessageInput("");
    closeModal();
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Clientes" />
      <ComponentCard title="Clientes">
        <DataTable
          data={contacts}
          columns={columns}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalEntries={total}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          search={searchInput}
          onSearchChange={(v) => setSearchInput(v)}
          fileName="clients"

          enableStatusFilter={true}
          statusOptions={statusOptions}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusChange}

          selectable={true}
          selectedRows={selectedContacts.map(c => c.id)}
          onSelectionChange={(ids) => {
            const fullObjects = contacts.filter(c => ids.includes(c.id));
            setSelectedContacts(fullObjects);
          }}
          selectionActions={(selected) => (
            <Button disabled={selected.length === 0} size="sm" onClick={openModal}>
              Enviar mensaje
            </Button>
          )}
        />
      </ComponentCard>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[500px] w-full m-4 p-6 rounded-xl bg-white dark:bg-gray-900"
      >
        <div className="flex flex-col items-center gap-4 text-center w-full mt-2">
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
            Enviar mensaje
          </h2>

          <input
            className="
              w-full rounded-lg border border-gray-300 dark:border-gray-700 mt-2
              bg-transparent px-4 py-2
              text-gray-800 dark:text-gray-200
              focus:outline-none focus:ring focus:ring-blue-500/30
            "
            placeholder="Escribe un mensaje..."
            value={messageInput}
            onChange={(e) => setmessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={loading}
          />

          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            <PaperPlaneIcon />
            {loading ? "Enviando..." : "Enviar"}
          </Button>

        </div>
      </Modal>
    </>
  );
}
