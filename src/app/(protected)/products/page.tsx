"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import DataTable from "@/dynamic-components/tables/DataTables/TableOne/DataTable";

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const { products, total, loading } = useProducts(currentPage, rowsPerPage, debouncedSearch);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [total, rowsPerPage]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearch]);

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
    { key: "stock", label: "Stock" },
    { key: "price", label: "Precio" },
    {
      key: "brand",
      label: "Marca",
      render: (item: any) => (item.brand ? <p>{item.brand}</p> : <p>None</p>),
    },
    {
      key: "category",
      label: "Categoria",
      render: (item: any) => (item.category ? <p>{item.category}</p> : <p>None</p>),
    },
    { key: "status", label: "Estatus" },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <PageBreadcrumb pageTitle="Productos" />
      <ComponentCard title="Productos">
        <DataTable
          data={products}
          columns={columns}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalEntries={total}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          search={searchInput}
          onSearchChange={(v) => setSearchInput(v)}
          fileName="products"
          enableAddButton={true}
          customActions={
            <Link href="/promotions"> 
              <Button variant="outline" size="sm"> Promociones </Button>
            </Link>
          }
        />
      </ComponentCard>
    </>
  );
}
