"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

import { useInvoiceMetrics } from "@/hooks/useInvoiceMetrics";
import { useInvoices } from "@/hooks/useInvoices";
import { useDebounce } from "@/hooks/useDebounce";
import Badge from "@/components/ui/badge/Badge";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InvoiceMetrics from "@/components/invoice/InvoiceMetrics";
import DataTable from "@/dynamic-components/tables/DataTables/TableOne/DataTable";



export default function InvoicesPage() {
  const organizationId = null

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { metrics, loading: loadingMetrics } = useInvoiceMetrics(organizationId);
  const { invoices, total, loading: loadingInvoices } = useInvoices(
    currentPage, rowsPerPage, debouncedSearch, statusFilter, organizationId
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [total, rowsPerPage, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearch, currentPage]);

  const statusOptions = ["paid", "pending", "canceled"];

  const columns = [
    { 
        key: "id", 
        label: "Pedido",
        render: (item: any) => (
          <Link href={`/invoices/${item.id}`} className="text-gray-500 hover:underline">
            {item.id}
          </Link>
        )
    },
    {
      key: "customer_name",
      label: "Cliente",
      render: (item: any) => (
        <div>
          <p className="font-medium">{item.customer_name}</p>
        </div>
      ),
    },
    { key: "total", label: "Total", render: (item: any) => <p>${item.total.toFixed(2)}</p> },
    { key: "status", label: "Estatus", render: (item: any) => <Badge size="sm" color={
      item.status === "paid" ? "success" :
      item.status === "pending" ? "warning" :
      item.status === "canceled" ? "error" : "dark"
    }>{item.status}</Badge> },
  ]


  if (loadingInvoices || loadingMetrics) return <p>Loading...</p>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Pedidos" />
      <InvoiceMetrics metrics={metrics}/>

      <DataTable
          data={invoices}
          columns={columns}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalEntries={total}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          search={searchInput}
          onSearchChange={(v) => setSearchInput(v)}
          fileName="invoices"

          enableStatusFilter={true}
          statusOptions={statusOptions}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => setStatusFilter(v)}
        />
    </div>
  );
}
