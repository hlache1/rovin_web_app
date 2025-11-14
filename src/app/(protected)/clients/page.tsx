"use client";
import React, { useState, useEffect } from "react";
import { useContactsWithSales } from "@/hooks/useContactsWithSales"; 
import { useDebounce } from "@/hooks/useDebounce";
import { useUser } from "@/hooks/useUser";
import { LEAD_STATUSES } from "@/utils/statuses";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/dynamic-components/tables/DataTables/TableOne/DataTable";

export default function ClientsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { user, loading: loadingUser } = useUser();
  const { contacts, total, loading } = useContactsWithSales(user?.id ?? null, currentPage, rowsPerPage, debouncedSearch, statusFilter);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [total, rowsPerPage, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearch, currentPage]);

  const statusOptions = LEAD_STATUSES.map(s => s.key);

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

  if (loading || loadingUser) return <p>Loading...</p>;

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
          onStatusFilterChange={(v) => setStatusFilter(v)}
        />
      </ComponentCard>
    </>
  );
}
