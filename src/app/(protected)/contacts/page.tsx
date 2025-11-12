"use client";
import React, { useState, useEffect } from "react";
import { useContacts } from "@/hooks/useContacts";
import { useDebounce } from "@/hooks/useDebounce";
import { useUser } from "@/hooks/useUser";
import Badge from "@/components/ui/badge/Badge";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/dynamic-components/tables/DataTables/TableOne/DataTable";

export default function ContactsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { user, loading: loadingUser } = useUser();
  const { contacts, total, loading } = useContacts(user?.id ?? null, currentPage, rowsPerPage, debouncedSearch, statusFilter);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [total, rowsPerPage, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearch, currentPage]);

  const statusOptions = ["Lead generado", "Lead ganado", "Lead activo", "Lead inactivo"];

  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (item: any) => (
        <div>
          <p className="font-medium">{item.name}</p>
        </div>
      ),
    },
    { key: "phone_number", label: "Número telefonico" },
    {
      key: "email",
      label: "Email",
      render: (item: any) => (item.email ? <p>{item.email}</p> : <p>None</p>),
    },
    {
      key: "status",
      label: "Estatus",
      render: (item: any) => (
        <Badge
          size="sm"
          color={
            item.status === "Lead inactivo" ? "primary" :
            item.status === "Lead generado" ? "dark" : 
            item.status === "Lead activo" ? "warning" :
            item.status === "Lead ganado" ? "success"
            : "error"
          }
          variant="light"
        >
          {item.status}
        </Badge>
      ),
    },
  ];

  if (loading || loadingUser) return <p>Loading...</p>;

  return (
    <>
      <PageBreadcrumb pageTitle="Contactos" />
      <ComponentCard title="Contactos">
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
          fileName="contacts"

          enableStatusFilter={true}
          statusOptions={statusOptions}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => setStatusFilter(v)}
        />
      </ComponentCard>
    </>
  );
}
